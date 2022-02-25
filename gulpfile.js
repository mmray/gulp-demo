const { src, dest, series, parallel, watch } = require('gulp')

// const sass = require('gulp-sass')
// const babel = require('gulp-babel')
// const swig = require('gulp-swig')
// const imagemin = require('gulp-imagemin')
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
const browserSync = require('browser-sync')
const bs = browserSync.create()

const del = require('del')

const data = {
  menus: [
    {
      name: 'Home',
      icon: 'aperture',
      link: 'index.html'
    },
    {
      name: 'Features',
      link: 'features.html'
    },
    {
      name: 'About',
      link: 'about.html'
    },
    {
      name: 'Contact',
      link: '#',
      children: [
        {
          name: 'Twitter',
          link: 'https://twitter.com/w_zce'
        },
        {
          name: 'About',
          link: 'https://weibo.com/zceme'
        },
        {
          name: 'divider'
        },
        {
          name: 'About',
          link: 'https://github.com/zce'
        }
      ]
    }
  ],
  pkg: require('./package.json'),
  date: new Date()
}

// CSS任务
const style = () => {
  // base 选项即dist目录下的src
  return src('src/assets/styles/*.scss', { base: 'src'})
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest('temp'))
}

// JS 任务
const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(plugins.babel({ presets: ['@babel/preset-env']} ))
    .pipe(dest('temp'))
}

// HTML 任务
const page = () => {
  return src('src/*.html', { base: 'src' } )
    .pipe(plugins.swig({data, defaults: { cache: false }}))   // 防止模板缓存导致页面不能及时更新
    .pipe(dest('temp'))
}

// Image 任务
const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

// Font 任务
const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

// 清除任务
const clean = () => {
  return del(['dist', 'temp'])
}

// 测试服务器
const serve = () => {
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)

  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], bs.reload)

  bs.init({
    notify: false,
    port: 2080,
    files: 'temp/**',
    server: {
      baseDir: ['temp', 'src', 'public'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

const extra = () => {
  return src('public/**')
    .pipe(dest('dist'))
}

const useref = () => {
  // 在执行 useref 过程中 可能存在读写冲突, 在压缩时，找不到对应文件，因为读写操作都在 dist 文件夹下
  // return src('dist/*.html', {base: 'dist'})
  //   .pipe(plugins.useref({ searchPath: ['dist', '.'] }))
  //   .pipe(plugins.if(/\.js$/, plugins.uglify()))
  //   .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
  //   .pipe(plugins.if(/\.html$/, plugins.htmlmin({
  //     collapseWhitespace: true,
  //     minifyCSS: true,
  //     minifyJS: true
  //   })))
  //   .pipe(dest('dist'))

  return src('temp/*.html', {base: 'temp'})
    .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest('dist'))

}

const compile = parallel(style, script, page)

const build = series(clean, parallel(series(compile, useref), image, font, extra))

const dev = series(compile, serve)


module.exports = {
  clean,
  build,
  dev
}