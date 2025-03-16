// Egzersiz modülleri için merkezi içe aktarma dosyası
// Uygulama başlangıcında bu dosyayı içe aktararak tüm egzersiz türlerini kaydedin

// Önce temel registry ve komposizyon dosyasını yükle
import './useExerciseRegistry.js';
import './useExercise.js';

// Sonra tüm egzersiz türlerini yükle
import './exercises/useWordMatch.js';
import './exercises/useFillInBlank.js';
import './exercises/useWordBuilder.js';
import './exercises/usePictureMatch.js';
import './exercises/useTextInput.js';

console.log('Tüm egzersiz modülleri yüklendi!');
