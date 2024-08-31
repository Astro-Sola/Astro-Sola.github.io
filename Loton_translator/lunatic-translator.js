// ルナティック語変換関数
function translateToLunatic(text) {
    // 単語ごとに処理
    return text.split(/\s+/).map(word => {
      // 小文字に変換
    word = word.toLowerCase();
    
      // 母音変更
    word = word.replace(/a(?!$)/g, 'aa')
                .replace(/e(?!$)/g, 'ee')
                .replace(/i/g, 'y')
                .replace(/o(?!$)/g, 'oo')
                .replace(/u/g, 'oe');

      // 子音変更
    word = word.replace(/c([ei])/g, 's$1')
                .replace(/c/g, 'k')
                .replace(/g([ei])/g, 'j$1')
                .replace(/z/g, 'ts')
                .replace(/v/g, 'w')
                .replace(/qu/g, 'kw');

      // 3音節以上の単語の処理
    let syllables = word.match(/[aeiou]/gi);
    if (syllables && syllables.length > 2) {
        let parts = word.split(/(?<=[aeiou])/i);
        word = parts.slice(0, 2).join('') + parts.slice(2).join('').replace(/aa|ee|oo/g, match => match[0]);
    }

      // 語末の処理
    if (word.length > 2 && /[aeiou]$/.test(word)) {
        word = word.slice(0, -1);
    }

    return word;
    }).join(' ');
}

  // HTML要素の取得
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const translateButton = document.getElementById('translateButton');

  // 翻訳ボタンのクリックイベント
translateButton.addEventListener('click', () => {
    const italianText = inputText.value;
    const lunaticText = translateToLunatic(italianText);
    outputText.textContent = lunaticText;
});