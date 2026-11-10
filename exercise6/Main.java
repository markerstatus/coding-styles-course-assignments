import java.io.File;
import java.io.FileInputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

// load plugins from config, then run extract → count → print.
public class Main {
    // Keep plugin loaders alive for the whole run (closing them unloads plugin
    // classes).
    private static final List<URLClassLoader> LOADERS = new ArrayList<>();

    public static void main(String[] args) throws Exception {
        // Need the input text file path from the command line
        if (args.length < 1) {
            System.out.println("Usage: java Main <path-to-text-file>");
            return;
        }

        // External config chooses which compiled plugins to use (no Main recompile
        // needed)
        Properties config = new Properties();
        try (FileInputStream fs = new FileInputStream("config.properties")) {
            config.load(fs);
        }

        // Dynamically load the two plugin roles from paths in config.properties
        WordsPlugin wordsPlugin = loadPlugin(config.getProperty("words"), WordsPlugin.class);
        FrequenciesPlugin frequenciesPlugin = loadPlugin(config.getProperty("frequencies"), FrequenciesPlugin.class);

        // extract words, then count / rank them
        List<String> words = wordsPlugin.extractWords(args[0]);
        List<WordCount> top25 = frequenciesPlugin.top25(words);

        // print
        for (WordCount wc : top25) {
            System.out.println(wc.getWord() + " - " + wc.getCount());
        }
    }

    // Load one .class file from plugins/ and return it as the requested plugin
    // interface
    private static <T> T loadPlugin(String classPath, Class<T> pluginType) throws Exception {
        File classFile = new File(classPath);

        // plugins/NormalWords.class → class name "NormalWords"
        String className = classFile.getName().replaceFirst("\\.class$", "");

        // Point a class loader at the plugins/ folder (parent = app classpath with
        // interfaces)
        URLClassLoader loader = new URLClassLoader(
                new URL[] { classFile.getParentFile().toURI().toURL() },
                ClassLoader.getSystemClassLoader());
        LOADERS.add(loader);

        // Reflect: load the class, check it implements the interface, then construct it
        Class<?> cls = loader.loadClass(className);
        if (!pluginType.isAssignableFrom(cls) || cls.isInterface()) {
            throw new IllegalStateException(
                    className + " is not a " + pluginType.getSimpleName());
        }
        return pluginType.cast(cls.getDeclaredConstructor().newInstance());
    }
}
