import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FirstLetterFrequencies implements FrequenciesPlugin {
    @Override
    public List<WordCount> top25(List<String> words) {
        Map<String, Integer> counts = new HashMap<>();
        for (String word : words) {
            if (word == null || word.isEmpty()) {
                continue;
            }
            String letter = String.valueOf(Character.toLowerCase(word.charAt(0)));
            counts.put(letter, counts.getOrDefault(letter, 0) + 1);
        }

        List<Map.Entry<String, Integer>> sorted = new ArrayList<>(counts.entrySet());
        sorted.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));

        List<WordCount> result = new ArrayList<>();
        int limit = Math.min(25, sorted.size());
        for (int i = 0; i < limit; i++) {
            Map.Entry<String, Integer> entry = sorted.get(i);
            result.add(new WordCount(entry.getKey(), entry.getValue()));
        }
        return result;
    }
}
