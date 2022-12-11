module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: "development",
  
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: "./src/index.js",
    // ファイルの出力設定
    output: {
      //  出力ファイルのディレクトリ名
      path: `${__dirname}/dist`,
      // 出力ファイル名
      filename: "main.js",
    },

    //ローカル開発用環境を立ち上げる
    //実行時にブラウザがlocalhostを開く
    devServer: {
        static: "dist",
        open: true,
    },

    devtool: "source-map",

    module: {
      rules: [
        {
            //css
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader'
            ]
        },
        {
            // 拡張子 .js の場合
            test: /\.js$/,
            use: [
                {
                // Babel を利用する
                loader: "babel-loader",
                // Babel のオプションを指定する
                options: {
                    presets: [
                    // プリセットを指定することで、ES2020 を ES5 に変換
                    ["@babel/preset-env"],
                    ],
                },
                },
            ],
        },
        {
            //画像系
            test: /\.(jpg|png|gif|svg)$/,
            type: 'asset/resource',
            generator:
            {
                filename: 'assets/images/[hash][ext]'
            }
        },
      ],
    },
    // ES5(IE11等)向けの指定
    target: ["web", "es5"],
  };