import gulp from "gulp"
import { path } from "./gulp/config/path.js"
import { plugins } from "./gulp/config/plugins.js";

import { copy } from './gulp/tasks/copy.js';
import { reset } from "./gulp/tasks/reset.js";
import { html } from "./gulp/tasks/html.js";
import { server } from "./gulp/tasks/server.js";
import { scss } from "./gulp/tasks/scss.js";
import { js } from "./gulp/tasks/js.js";
import { images } from "./gulp/tasks/images.js";
import { otfToTtf, ttfToWoff, fontsStyle } from "./gulp/tasks/fonts.js";
import { svgSprive } from "./gulp/tasks/svgSprive.js";
import { zip } from "./gulp/tasks/zip.js";
import { ftp } from "./gulp/tasks/ftp.js";
import { json } from "./gulp/tasks/json.js";

global.app = {
    isBuild: process.argv.includes('--build'),
    isDev: !process.argv.includes('--build'),
    path: path,
    gulp: gulp,
    plugins: plugins
}

//наблюдение за изменениями файла
function watcher () {
    gulp.watch(path.watch.files, copy) // для того чтоб при обновлении сразу попадало на ftp заменить copy на gulp.series(copy, ftp)
    gulp.watch(path.watch.html, html) // для того чтоб при обновлении сразу попадало на ftp заменить html на gulp.series(html, ftp)
    gulp.watch(path.watch.scss, scss) // для того чтоб при обновлении сразу попадало на ftp заменить scss на gulp.series(scss, ftp)
    gulp.watch(path.watch.js, js) // для того чтоб при обновлении сразу попадало на ftp заменить js на gulp.series(js, ftp)
    gulp.watch(path.watch.images, images) // для того чтоб при обновлении сразу попадало на ftp заменить images на gulp.series(images, ftp)
    gulp.watch(path.watch.json, json)
}images

export { svgSprive }

//  Последовательная обрпботка шрифтов
const fonts = gulp.series(otfToTtf, ttfToWoff, fontsStyle)

// обновление задач
const mainTasks = gulp.series(fonts, gulp.parallel(copy, html, scss, json, js, images))

// построение сценариев выполнения задач (series - последовательно)
const dev = gulp.series(reset, mainTasks, gulp.parallel(watcher, server))
const build = gulp.series(reset, mainTasks);
const deployZIP = gulp.series(reset, mainTasks, zip)
const deployFTP = gulp.series(reset, mainTasks, ftp)

// Экспорт сценариев
export { dev }
export { build }
export { deployZIP }
export { deployFTP }

// выполнение сценария по умолчанию
gulp.task('default', dev)



// В файле package.json все версии в devDependencies переписать на latest для того чтоб при установки в новом проекте устанавливались новые пакетыб но нужно следить на одновлениями и ошибами