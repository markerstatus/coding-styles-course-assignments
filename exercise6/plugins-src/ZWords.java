import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// Words plugin that keeps only words containing the letter z.
public class ZWords implements WordsPlugin {
    public List<String> extractWords(String pathToFile) throws Exception {
        // Read the book and split it into lowercase letter-only tokens
        String data = Files.readString(Paths.get(pathToFile));
        String[] tokens = data.toLowerCase().replaceAll("[^a-z]+", " ").split("\\s+");

        Set<String> stopWords = loadStopWords();
        List<String> words = new ArrayList<>();
        for (String token : tokens) {
            // Keep tokens that are real words and contain a z
            if (!token.isEmpty()
                    && !stopWords.contains(token)
                    && token.indexOf('z') >= 0) {
                words.add(token);
            }
        }
        return words;
    }

    // Load stop_words.txt and also drop single letters a–z
    private Set<String> loadStopWords() throws Exception {
        String raw = Files.readString(Paths.get("stop_words.txt"));
        Set<String> stopWords = new HashSet<>(Arrays.asList(raw.trim().split(",")));
        for (char c = 'a'; c <= 'z'; c++) {
            stopWords.add(String.valueOf(c));
        }
        return stopWords;
    }
}
