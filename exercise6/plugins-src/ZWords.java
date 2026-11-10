import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ZWords implements WordsPlugin {
    @Override
    public List<String> extractWords(String pathToFile) throws Exception {
        String data = Files.readString(Paths.get(pathToFile));
        String[] tokens = data.toLowerCase().replaceAll("[^a-z]+", " ").trim().split("\\s+");

        Set<String> stopWords = loadStopWords();
        List<String> words = new ArrayList<>();
        for (String token : tokens) {
            if (!token.isEmpty()
                    && !stopWords.contains(token)
                    && token.indexOf('z') >= 0) {
                words.add(token);
            }
        }
        return words;
    }

    private static Set<String> loadStopWords() throws Exception {
        String raw = Files.readString(Paths.get("stop_words.txt"));
        Set<String> stopWords = new HashSet<>(Arrays.asList(raw.trim().split(",")));
        for (char c = 'a'; c <= 'z'; c++) {
            stopWords.add(String.valueOf(c));
        }
        return stopWords;
    }
}
