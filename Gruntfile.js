module.exports = function(grunt) {

    var webScriptPath = 'src/client/web/js';
    var conf = require('./nconf');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cfg: require('./nconf'),
        gameScriptPath: 'src/client/game/js',
        clean: {
            web: ['deploy/web'],
            game: ['<%= cfg.get("clientDir") %>']
        },
        jshint: {
            files: ['src/client/web/js/**/*.js', 'Game/**/*.js']
        },
        jasmine: {
            pivotal: {
                src: 'src/client/web/js/**/*.js',
                options: {
                    specs: 'spec/*Spec.js',
                    helpers: 'spec/*Helper.js'
                }
            }
        },
        concat: {
            web: {
                src: [webScriptPath + '/app.js', webScriptPath + '/**/*.js'],
                dest: 'deploy/web/js/<%= pkg.name %>-<%= pkg.version %>.js'
            },
            game: {
                src: [ // order matters!
                    "src/client/game/shared.js",
                    "<%= gameScriptPath %>/ng/app.js", // load angular app first
                    "<%= gameScriptPath %>/ng/chat.js",
                    "<%= gameScriptPath %>/ng/game.js",
                    "<%= gameScriptPath %>/ng/news.js",
                    "<%= gameScriptPath %>/External/seedrandom.js",
                    "<%= gameScriptPath %>/External/ImprovedNoise.js",
                    "<%= gameScriptPath %>/External/Init.js",
                    "<%= gameScriptPath %>/External/Util.js",
                    "<%= gameScriptPath %>/External/Shared.js",
                    "<%= gameScriptPath %>/External/Stats.js",
                    "<%= gameScriptPath %>/External/SteeringBehaviourLight.js",
                    "<%= gameScriptPath %>/External/NodeHandler.js",

                    "<%= gameScriptPath %>/Engine/Debug.js",
                    "<%= gameScriptPath %>/Engine/Events.js",
                    "<%= gameScriptPath %>/Engine/Input.js",
                    "<%= gameScriptPath %>/Engine/SocketHandler.js",
                    "<%= gameScriptPath %>/Engine/SoundHandler.js",
                    "<%= gameScriptPath %>/Engine/TextureHandler.js",
                    "<%= gameScriptPath %>/Engine/MeshHandler.js",
                    "<%= gameScriptPath %>/Engine/Shaders/PixelationShader.js",
                    "<%= gameScriptPath %>/Game/Hud.js",
                    "<%= gameScriptPath %>/Game/PhysicsObject.js",
                    "<%= gameScriptPath %>/Game/Unit.js",
                    "<%= gameScriptPath %>/Game/Billboard.js",
                    "<%= gameScriptPath %>/Game/Waypoint.js",
                    "<%= gameScriptPath %>/Game/ChatBubble.js",
                    "<%= gameScriptPath %>/Game/Mesh.js",
                    "<%= gameScriptPath %>/Game/DynamicMesh.js",
                    "<%= gameScriptPath %>/Game/MovingObstacle.js",
                    "<%= gameScriptPath %>/Game/Train.js",
                    "<%= gameScriptPath %>/Game/ToggleableObstacle.js",
                    "<%= gameScriptPath %>/Game/Lever.js",
                    "<%= gameScriptPath %>/Game/TeleportEntrance.js",
                    "<%= gameScriptPath %>/Game/TeleportExit.js",
                    "<%= gameScriptPath %>/Game/HeartPiece.js",
                    "<%= gameScriptPath %>/Game/MusicPlayer.js",
                    "<%= gameScriptPath %>/Game/Sign.js",
                    "<%= gameScriptPath %>/Game/Skybox.js",
                    "<%= gameScriptPath %>/Game/LootBag.js",
                    "<%= gameScriptPath %>/Game/LootableMesh.js",
                    "<%= gameScriptPath %>/Game/Fighter.js",
                    "<%= gameScriptPath %>/Game/Player.js",
                    "<%= gameScriptPath %>/Game/Cell.js",
                    "<%= gameScriptPath %>/Game/Cinema.js",
                    "<%= gameScriptPath %>/Game/Cutscenes.js",
                    "<%= gameScriptPath %>/Game/ParticleTypes.js",
                    "<%= gameScriptPath %>/Game/Projectile.js",
                    "<%= gameScriptPath %>/Game/ParticleEmitter.js",
                    "<%= gameScriptPath %>/Game/ParticleHandler.js",
                    "<%= gameScriptPath %>/Game/TerrainHandler.js",
                    "<%= gameScriptPath %>/Game/LevelEditor.js"
                ],
                dest: '<%= cfg.get("clientDir") %>js/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            web: {
                src: 'deploy/web/js/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'deploy/web/js/<%= pkg.name %>-<%= pkg.version %>.min.js'
            },
            game: {
                src: '<%= cfg.get("clientDir") %>js/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: '<%= cfg.get("clientDir") %>js/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        less: {
            web: {
                options: {
                    yuicompress: true
                },
                files: {
                    'deploy/web/css/<%= pkg.name %>.css': 'src/client/web/css/ironbane.less'
                }
            },
            game: {
                options: {
                    yuicompress: true
                },
                files: {
                    '<%= cfg.get("clientDir") %>css/<%= pkg.name %>.css': 'src/client/game/css/ironbane.less'
                }
            }
        },
        replace: {
            web: {
                options: {
                    variables: {
                        root: '<%= cfg.get("root") %>'
                    }
                },
                files: [
                    {expand: true, flatten: true, src: ['src/client/web/index.html'], dest: 'deploy/web/'}
                ]
            },
            game: {
                options: {
                    variables: {
                        root: '<%= cfg.get("root") %>',
                        host: '<%= cfg.get("game_host") %>',
                        port: '<%= cfg.get("server_port") %>',
                        appName: '<%= pkg.name %>',
                        appVersion: '<%= pkg.version %>',
                        gameVersion: 'v<%= pkg.version %> Alpha' //todo: have alpha/beta stored in config?
                    }
                },
                files: [
                    {expand: true, flatten: true, src: ['src/client/game/index.html'], dest: '<%= cfg.get("clientDir") %>'}
                ]
            }
        },
        copy: {
            options: {
                processContentExclude: ['**/*.{png,gif,jpg,ico,psd}']
            },
            web: {
                files: [{
                    src: 'src/client/web/views/*',
                    dest: 'deploy/web/views/',
                    expand: true,
                    flatten: true
                }, {
                    src: 'src/client/web/partials/*',
                    dest: 'deploy/web/partials/',
                    expand: true,
                    flatten: true
                }, {
                    src: 'images/**/*',
                    dest: 'deploy/web/',
                    cwd: 'src/client/web',
                    expand: true
                }, {
                    src: 'font/**/*',
                    dest: 'deploy/web/',
                    cwd: 'src/client/web',
                    expand: true
                }, { // TODO: setup lib to copy only certain files?
                    src: 'lib/**/*',
                    dest: 'deploy/web/',
                    expand: true,
                    cwd: 'src/client/web'
                }]
            },
            game: {
                files: [{
                    // this is the folder structure only? get actual game data elsewhere?
                    src: 'media/**/*',
                    dest: '<%= cfg.get("clientDir") %>',
                    cwd: 'src/client/game',
                    expand: true
                }, {
                    src: 'lib/**/*',
                    dest: '<%= cfg.get("clientDir") %>',
                    expand: true,
                    cwd: 'src/client/game'
                }, {
                    src: 'flash/**/*',
                    dest: '<%= cfg.get("clientDir") %>',
                    expand: true,
                    cwd: 'src/client/game'
                }, {
                    src: ['**/*'],
                    dest: '<%= cfg.get("clientDir") %>',
                    expand: true,
                    cwd: '<%= cfg.get("assetDir") %>'
                }, {
                    src: 'favicon.ico',
                    dest: '<%= cfg.get("clientDir") %>',
                    expand: true,
                    cwd: 'src/client/game'
                }]
            }
        },
        watch: {
            css: {
                files: 'src/client/web/css/**/*',
                tasks: ['less', 'beep']
            },
            html: {
                files: 'src/client/web/**/*.html',
                tasks: ['default', 'beep']
            },
            js: {
                files: 'src/client/web/**/*.js',
                tasks: ['default', 'beep']
            }
        }
    });

    // load tasks
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-beep');
    grunt.loadNpmTasks('grunt-replace');

    // Default task(s).
    grunt.registerTask('default', ['clean:game', 'concat:game', 'uglify:game', 'less:game', 'replace:game', 'copy:game']);

};