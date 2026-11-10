import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Frequencies plugin that ranks words by their first letter.
public class FirstLetterFrequencies implements FrequenciesPlugin {
    public List<WordCount> top25(List<String> words) {
        // Count how often each starting letter appears
        Map<String, Integer> counts = new HashMap<>();
        for (String word : words) {
            String letter = String.valueOf(word.charAt(0));
            counts.put(letter, counts.getOrDefault(letter, 0) + 1);
        }

        // Highest count first
        List<Map.Entry<String, Integer>> sorted = new ArrayList<>(counts.entrySet());
        sorted.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));

        // Keep at most the top 25 letters
        List<WordCount> result = new ArrayList<>();
        int limit = Math.min(25, sorted.size());
        for (int i = 0; i < limit; i++) {
            Map.Entry<String, Integer> entry = sorted.get(i);
            result.add(new WordCount(entry.getKey(), entry.getValue()));
        }
        return result;
    }
}
