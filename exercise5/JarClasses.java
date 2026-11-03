// read jar file
import java.io.File;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.Enumeration;
// load classes from jar file
import java.net.URL;
import java.net.URLClassLoader;
// reflect classes
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
// sort and collect
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


// need to have a argument to the program to specify the jar file
public class JarClasses {
    public static void main(String[] args) throws Exception {
        // Need a jar path from the command line
        if (args.length < 1) {
            System.out.println("Require a jar file path in argument");
            return;
        }

        // args[0] = first CLI argument = path to the jar
        File jarFile = new File(args[0]);
        // collect the class names from the jar file -> list of names
        List<String> classNames = collectClassNames(jarFile);
        // sort the class names alphabetically
        Collections.sort(classNames);
        // load the classes from the jar file
        try (URLClassLoader loader = new URLClassLoader(
                new URL[] { jarFile.toURI().toURL() },
                ClassLoader.getSystemClassLoader())) {
            for (String className : classNames) {
                Class<?> cls = loader.loadClass(className);
                inspectClassInfo(cls);
            }
        }
    }

    // format the class names
    private static List<String> collectClassNames(File jarFile) throws Exception {
        List<String> classNames = new ArrayList<>();
        try (JarFile jar = new JarFile(jarFile)) {
            // Jar is like a zip: entries are paths inside it
            Enumeration<JarEntry> entries = jar.entries();
            while (entries.hasMoreElements()) {
                JarEntry entry = entries.nextElement();
                String name = entry.getName();
                // Keep real .class files only.
                // Skip directories, META-INF (multi-release overlays), and module-info
                // (module descriptors are not loadable as normal classes).
                if (name.endsWith(".class")
                        && !entry.isDirectory()
                        && !name.startsWith("META-INF/")
                        && !name.endsWith("module-info.class")) {
                    String className = name
                            .substring(0, name.length() - ".class".length())
                            .replace('/', '.'); // Java packages use dots, jar paths use /
                    classNames.add(className);
                }
            }
        }
        return classNames;
    }

    private static void inspectClassInfo(Class<?> cls) {
        // Reflection: ask the Class object what it contains
        Method[] methods = cls.getDeclaredMethods();
        Field[] fields = cls.getDeclaredFields();

        int publicMethods = 0;
        int privateMethods = 0;
        int protectedMethods = 0;
        int staticMethods = 0;

        for (Method method : methods) {
            // bit flags for public/private/static/protected
            // one method can have multiple modifiers
            int mods = method.getModifiers(); 
            if (Modifier.isPublic(mods)) {
                publicMethods++;
            }
            if (Modifier.isPrivate(mods)) {
                privateMethods++;
            }
            if (Modifier.isProtected(mods)) {
                protectedMethods++;
            }
            if (Modifier.isStatic(mods)) {
                staticMethods++;
            }
        }

        printClassInfo(cls, publicMethods, privateMethods, protectedMethods, staticMethods, fields);
    }

    private static void printClassInfo(Class<?> cls, int publicMethods, int privateMethods, int protectedMethods, int staticMethods, Field[] fields) {
        System.out.println("----------" + cls.getName() + "----------");
        System.out.println("Public methods: " + publicMethods);
        System.out.println("Private methods: " + privateMethods);
        System.out.println("Protected methods: " + protectedMethods);
        System.out.println("Static methods: " + staticMethods);
        System.out.println("Fields: " + fields.length);
    }
}
