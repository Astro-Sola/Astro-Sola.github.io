// 母音
const vowelMapping = {
  'e': 'a',
  'i': 'e',
  'a': 'i',
  'u': 'o',
  'o': 'u',
  'ä': 'er',
  'ö': 'oe',
  'ü': 'y',
};
const consonantMapping = {
  //子音のマッピング
  'n': 'l',
  'r': 'l',
  'd': 'n',
  'h': '',
  'c': 'k',
  'g': 'v',
  'b': 'p',
  'w': 'f',
  'f': 'h',
  'z': 's',
  'p': 'b',
  'v': 'f',
  'k': 'g',
  'j': 'y',
  'q': 'k',
  'x': 's',
  'ß': 's'
};

// 連続した子音を単一の子音に変換する関数
function zipConsonants(str) {
  // 複数の連続する子音を1文字に置き換える
  return str.replace(/([^aeiouäöüß])\1+/g, "$1");
}
// 4つ目の母音以降を削除する関数
function removeExtraVowels(str) {
  // 母音（a, e, i, o, u, ä, ö, ü）をキャプチャ
  let vowelCount = 0;
  for (let i = 0; i < str.length; i++) {
    if (/[aeiouäöü]/.test(str[i])) {
      vowelCount++;
      if (vowelCount === 3) {
        return str.slice(0, i + 1);
      }
    }
  }
  return str; // 母音が3つ以下の場合はそのまま
}
// 単語の中の母音の数を数える
  function countVowels(str) {
    const vowels = 'aeiouyäöü';
    return str.split('').filter(char => vowels.includes(char)).length;
}

function removeEndingPatterns(str) {
  const patterns = ['sch', 'ch', 'en', 'chen', 'lich']; // 母音が1つの場合に削除するパターン
  const specialPatterns = ['ern', 'er']; // 母音が1つの場合に保持するパターン

  const vowelCount = countVowels(str);

  if (vowelCount === 1) {
      // 母音が1つの場合
      for (let pattern of specialPatterns) {
          if (str.endsWith(pattern)) {
              return str; // 特殊なパターンで終わる場合はそのまま返す
          }
      }
      // 特殊なパターンでなければ、他のパターンを削除
      for (let pattern of patterns) {
          if (str.endsWith(pattern)) {
              return str.slice(0, -pattern.length);
          }
      }
  } else {
      // 母音が2つ以上の場合
      for (let pattern of [...patterns, ...specialPatterns]) {
          if (str.endsWith(pattern)) {
              return str.slice(0, -pattern.length);
          }
      }
  }

  return str; // どのパターンにも一致しない場合はそのまま返す
}

function convertByMapping(input) {
    console.log("Input:", input); // デバッグ用ログ
  
    // Step 1: 子音を変換
    let consonantConverted = input.split('').map(char => {
      console.log("Processing consonant:", char); // デバッグ用ログ
      return consonantMapping[char] || char;
    }).join('');
  
    console.log("After consonant conversion:", consonantConverted); // デバッグ用ログ
  
    // Step 2: 母音を変換
    let fullyConverted = consonantConverted.split('').map(char => {
      console.log("Processing vowel:", char); // デバッグ用ログ
      return vowelMapping[char] || char;
    }).join('');
  
    console.log("After vowel conversion:", fullyConverted); // デバッグ用ログ
    return fullyConverted;
  }  

// 文字列を変換する関数
function convertText(inputText) {
  const outputText = inputText.split(/(\s+|\n+)/).map(word => {   // 単語ごとに処理
    // 空白や改行そのものは変換しない
    if (/\s+|\n+/.test(word)) {
      return word;  // 区切り文字はそのまま返す
    }
    word = word.toLowerCase();  // 小文字に変換
    word = removeEndingPatterns(word); // ドイツ語の特徴的な末尾音を消す
    word = zipConsonants(word); // 連続子音の変換
    word = removeExtraVowels(word);  // 4つ目の母音以降の削除
    word = convertByMapping(word); // マッピングで子音変換・母音変換

  return word;
  }).join('');
  return outputText;
}

if (typeof document !== 'undefined') {
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  const translateButton = document.getElementById('translateButton');

  // 翻訳ボタンのクリックイベント
  translateButton.addEventListener('click', () => {
    const lotonText = convertText(inputText.value);
    console.log(lotonText);
    outputText.value = lotonText;
  });
}

export { removeExtraVowels };