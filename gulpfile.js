//plugin do gulp
var gulp = require('gulp');

//plugin para adicionar anotações de injeção de dependência no angularjs
var ngAnnotate = require('gulp-ng-annotate');

//plugin para concatenar arquivos
var concat = require('gulp-concat');

//plugin para minificar js
var uglify = require('gulp-uglify');

//plugin para minificar css
var cssmin = require('gulp-cssmin');

//plugin para Substituir os blocos de construção em HTML
var htmlReplace = require('gulp-html-replace');

//plugin para remover arquivos e pastas
var clean = require('gulp-clean');

//plugin para otimizar imagens
var imagemin = require('gulp-imagemin');

//plugin para zipar arquivos
var zip = require('gulp-zip');

var babel  = require('gulp-babel');

//***Variaveis***//
var caminhoPastaProjeto = 'C:/Backup Unidade D/AutoCom/project/ac-posto-frontend/src/';
var destinoPackage = 'c:/versao-ac-posto/';

//copia a pasta webapp e raliza as otimizações
gulp.task('build', ['copy-folder-application', 'copy-folder-partials', 'copy-folder-resources', 'copy-files'], function(){
	gulp.start('copy-controllers');
	gulp.start('copy-relatorios');
	gulp.start('copy-services');
	gulp.start('copy-utils');
	gulp.start('copy-css');
	gulp.start('build-html');
	gulp.start('otimizar-img');
});

//finaliza o deploy e gera o package.nw
gulp.task('deploy', ['zip'], function(){
	gulp.start('clean-dist');
	gulp.start('clean-webapp');
});

//copia a pasta application
gulp.task('copy-folder-application', function(){
	return gulp.src(caminhoPastaProjeto + 'application/**/*').pipe(gulp.dest('webapp/application'));
});

//copa a pasta partials
gulp.task('copy-folder-partials', function(){
	return gulp.src(caminhoPastaProjeto + 'partials/**/*').pipe(gulp.dest('webapp/partials'));
});

//copa a pasta resources
gulp.task('copy-folder-resources', function(){
	return gulp.src(caminhoPastaProjeto + 'resources/**/*').pipe(gulp.dest('webapp/resources'));
});

//copia o restante dos arquivos
gulp.task('copy-files', function(){
	return gulp.src([caminhoPastaProjeto + 'icone.png',
	                 			caminhoPastaProjeto + 'index.html',
	                 			caminhoPastaProjeto + 'package.json'])
				.pipe(gulp.dest('webapp/'));
});


//remove pasta dist
gulp.task('clean-dist', function(){
	gulp.src('dist/').pipe(clean());
})

//remove pasta webapp do projeto
gulp.task('clean-webapp', function(){
	gulp.src('webapp/').pipe(clean());
})

//comprime a pasta webapp gerando o package.nw
gulp.task('zip', function(){
	return gulp.src('webapp/**/*')
	.pipe(zip('package.nw'))
	.pipe(gulp.dest(destinoPackage))
});

//aponta para os arquivos minificados no index.html
gulp.task('build-html', function(){
	return gulp.src('webapp/index.html')
	.pipe(htmlReplace({
		controllers: 'application/controllers/controllers.min.js',
		relatorios : 'application/relatorio/relatorios.min.js',
		services : 'application/service/services.min.js',
		utils : 'application/util/utils.min.js',
		styles : 'resources/css/styles.min.css'
	}))
	.pipe(gulp.dest('webapp/'))
});

//otimiza as imagens
gulp.task('otimizar-img', function(){
	return gulp.src('webapp/resources/img/*')
	.pipe(imagemin())
	.pipe(gulp.dest('webapp/resources/img'))
});	

//################################################
// #######   Concatenação e Minificacao  #######
// ################################################

//concatena e minifica os css
gulp.task('concat-css', function(){
	return gulp.src('webapp/resources/css/*.css')
	.pipe(concat('styles.min.css'))
	.pipe(cssmin())
	.pipe(gulp.dest('dist/css/'))
});

//concatena e minifica os controllers.js
gulp.task('concat-controllers', function(){
	return concatenarJs('webapp/application/controllers/*.js', 'controllers.min.js', 'dist/controllers/');
});

//concatena e minifica os relatorios.js
gulp.task('concat-relatorios', function(){
	return concatenarJs('webapp/application/relatorio/*.js', 'relatorios.min.js', 'dist/relatorios/');
});

//concatena e minifica os service.js
gulp.task('concat-services', function(){
	return concatenarJs('webapp/application/service/*.js', 'services.min.js', 'dist/services/');
});

//concatena e minifica os util.js
gulp.task('concat-utils', function(){
	return concatenarJs('webapp/application/util/*.js', 'utils.min.js', 'dist/utils/');
});

//################################################
// #######   Copia para as pastas  #######
// ################################################

//copia os css concatenado para a pasta css dentro de webapp
gulp.task('copy-css', ['concat-css'], function(){
	gulp.src('webapp/resources/css/*.css').pipe(clean());
	gulp.src('dist/css/styles.min.css').pipe(gulp.dest('webapp/resources/css/'))
})

//copia os controllers concatenado para a pasta controllers
gulp.task('copy-controllers', ['concat-controllers'], function(){
	 copiarJs('dist/controllers/controllers.min.js','webapp/application/controllers/');
});

//copia os relatorios concatenado para a pasta relatorio
gulp.task('copy-relatorios', ['concat-relatorios'], function(){
	 copiarJs('dist/relatorios/relatorios.min.js', 'webapp/application/relatorio/');
});

//copia os services concatenado para a pasta service
gulp.task('copy-services', ['concat-services'], function(){
	 copiarJs('dist/services/services.min.js', 'webapp/application/service/');
});

//copia os utils concatenado para a pasta util
gulp.task('copy-utils', ['concat-utils'], function(){
	 copiarJs('dist/utils/utils.min.js','webapp/application/util/');
});


//################################################
// #######   Funções Genericas  #######
// ################################################

//concatena e minifica
function concatenarJs(orig, name, dest){
	return gulp.src(orig)
	.pipe(babel({presets: ['es2015']}))
	.pipe(concat(name))
	.pipe(ngAnnotate())
	.pipe(uglify())
	.pipe(gulp.dest(dest))
}

//copia arquivos js
function copiarJs(orig, pasta){
	gulp.src(pasta + '*.js')
	.pipe(clean());
	gulp.src(orig)
	.pipe(gulp.dest(pasta))
}
