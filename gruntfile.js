'use strict';

var path = require('path');

module.exports = function(grunt) {
	// Do grunt-related things in here
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				options: {
					style: 'expanded'
				},
				files: {
					'app/css/styles.css': 'app/sass/styles.scss'
				}
			}
		},
		shell: {
      git_add: {
        command: 'git add -A'
      },
      git_commit: {
        command: 'git commit -m "<%= pkg.name %> - <%= pkg.lastComment %>"'
      },
      git_push: {
      	options: {
          stdout: true
        },
        command: 'git push'
      },
			git_deploy:{
				options: {
          stdout: true
        },
				command:[
					'tempDir=`mktemp -d`',
					'git clone -b gh-pages <%= pkg.repository %> $tempDir',
					'cp -rT app $tempDir',
					'cd $tempDir',
					'git add -A',
					'git commit -m "<%= pkg.name %>: <%= pkg.lastComment %>"',
					'git push'
				].join(' && ')
			}
		},
		backup: {
	    root_backup: {
      	src: '.',
      	dest: '../<%= pkg.name %>.tgz'
	    },
		},
    watch: {
    	options: { livereload: 35730 },
    	sass: {
      	files: ['app/sass/styles.scss'],
      	tasks: ['newer:sass:dist']
    	},
			htmljs: {
				files: ['app/index.html', 'app/script.js']
			}
    },
    bumpup: {
      file: 'package.json'
    },
		connect: {
			server: {
				options: {
					port: 9005,
					base: 'app',
					hostname: '*',
					livereload:true
				}
			}
		},
		sshconfig: {
			webserver: {
				host: process.env.SSH_DEPLOY_HOST,
				username: process.env.SSH_DEPLOY_USER,
				agent: process.env.SSH_AUTH_SOCK,
				agentForward: true
			}
		},
		sshexec: {
			deploy: {
				command: [
					'cd ' + process.env.SSH_DEPLOY_PATH,
					'git pull origin master',
				].join(' && '),
				options: {
					config: 'webserver'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-backup');
	grunt.loadNpmTasks('grunt-ssh')
	grunt.loadNpmTasks('grunt-bumpup');

	grunt.task.registerTask('default', ['connect','watch']);
	grunt.task.registerTask('git', ['bumpup:patch','shell:git_add','shell:git_commit','shell:git_push']);
	grunt.task.registerTask('gh-deploy', ['shell:git_deploy']);
	grunt.task.registerTask('ssh-deploy', ['sshexec:deploy']);

};
