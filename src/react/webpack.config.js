const path = require('path');
const Webpack = require('webpack');  //配置webpack热更新
const HtmlWebpackPlugin = require('html-webpack-plugin');  //提供HTML模板
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');  //将CSS从JS文件中分离
const {CleanWebpackPlugin} = require('clean-webpack-plugin');  //打包前清除文件夹

module.exports = {
    entry : './src/index.js',  //入口
    output : {
        //添加hash值防止浏览器缓存
        filename : 'bundle.[hash:4].js',
        path : path.resolve('../../public'),
        publicPath : ''  //静态资源最终访问路径相对值
    },  //出口
    module : {
        rules : [
            {
                test : /\.(png|svg|jpg|gif)$/,  //解析图像
                use : {
                    loader : 'file-loader',
                    options : {
                        publicPath : '../'  //图像引用路径
                    }
                }
            },
            {
                test : /\.css$/,  //解析CSS文件
                use : ExtractTextWebpackPlugin.extract({
                    use : ['css-loader', 'postcss-loader']
                })
            },
            {
                test : /\.(js|jsx)$/,  //转义JS或JSX文件
                use : 'babel-loader',
                include : /src/,  //只转义src下的JS文件
                exclude : /node_modules/  //排除掉node_modules文件夹下的，优化打包速度
            }
        ]
    },  //处理模块
    plugins: [
        new Webpack.HotModuleReplacementPlugin(),  //webpack热更新，不是刷新
        new HtmlWebpackPlugin({
            //指明用哪个HTML作为挂载模板
            template : './src/index.html',
            hash : true
        }),
        //将拆分后的CSS放置在dist/css/style.css
        //此时不用使用style-loader
        new ExtractTextWebpackPlugin('css/style.css'),
        new CleanWebpackPlugin()
    ],  //插件
    devServer : {
        contentBase : './src',
        host : 'localhost',
        port : 3000,  //端口
        open : true,  //是否打开浏览器
        hot : true  //开启热更新
    },  //开发服务器配置
    mode : 'production',  //模式
    resolve : {
        extensions : ['.js', '.json', '.css']
    },  //配置别名、省略后缀名
    devtool : ''
}