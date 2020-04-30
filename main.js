const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron')
const path = require('path')

let mainWindow

// 自定义菜单栏
function setWindowMenu() {
  let menuTemplate = [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+W',
          role: 'exit'
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        }, {
          label: '重做',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        }, {
          type: 'separator'
        }, {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        }, {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        }, {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        }, {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    }, {
      label: '查看',
      submenu: [
        {
          label: '重启',
          accelerator: 'CmdOrCtrl+R',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              // 重载之后, 刷新并关闭所有的次要窗体
              if (focusedWindow.id === 1) {
                BrowserWindow.getAllWindows().forEach(function (win) {
                  if (win.id > 1) {
                    win.close()
                  }
                })
              }
              focusedWindow.reload()
            }
          }
        }, {
          label: '开发者工具',
          accelerator: (function () {
            if (process.platform === 'darwin') {
              return 'Alt+Command+I'
            } else {
              return 'Ctrl+Shift+I'
            }
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.toggleDevTools()
            }
          }
        }, {
          type: 'separator'
        }, {
          label: '应用程序菜单演示',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              const options = {
                type: 'info',
                title: '应用程序菜单演示',
                buttons: ['好的'],
                message: '此演示用于 "菜单" 部分, 展示如何在应用程序菜单中创建可点击的菜单项.'
              }
              electron.dialog.showMessageBox(focusedWindow, options, function () { })
            }
          }
        }
      ]
    }, {
      label: '窗口',
      role: 'window',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        }, {
          label: '最大化',
          accelerator: (function () {
            if (process.platform === 'darwin') {
              return 'Ctrl+Command+F'
            } else {
              return 'F11'
            }
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            }
          }
        }, {
          label: '关闭',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }, {
          type: 'separator'
        }, {
          label: '重新打开窗口',
          accelerator: 'CmdOrCtrl+Shift+T',
          enabled: false,
          key: 'reopenMenuItem',
          click: function () {
            app.emit('activate')
          }
        }
      ]
    }, {
      label: '帮助',
      role: 'help',
      submenu: [{
        label: '学习更多',
        click: function () {
          electron.shell.openExternal('http://electron.atom.io')
        }
      }]
    }]

  function addUpdateMenuItems(items, position) {
    if (process.mas) return

    const version = electron.app.getVersion()
    let updateItems = [
      {
        label: `Version ${version}`,
        enabled: false
      }, {
        label: '正在检查更新',
        enabled: false,
        key: 'checkingForUpdate'
      }, {
        label: '检查更新',
        visible: false,
        key: 'checkForUpdate',
        click: function () {
          require('electron').autoUpdater.checkForUpdates()
        }
      }, {
        label: '重启并安装更新',
        enabled: true,
        visible: false,
        key: 'restartToUpdate',
        click: function () {
          require('electron').autoUpdater.quitAndInstall()
        }
      }
    ]

    items.splice.apply(items, [position, 0].concat(updateItems))
  }
  let menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

// 自定义系统托盘菜单
function trayMenu() {
  // 系统托盘右键菜单
  let trayMenuTemplate = [
    {
      label: '设置',
      click: function () { } //打开相应页面
    },
    {
      label: '帮助',
      click: function () { }
    },
    {
      label: '关于',
      click: function () { }
    },
    {
      label: '退出',
      click: function () {
        app.quit();
      }
    }
  ];

  // appTray = new Tray(path.join(__dirname, 'favicon.ico')); // favicon.ico是img目录下的ico文件
  const trayIcon = path.join(__dirname, 'favicon.ico') // __dirname为主进程执行的同级目录
  appTray = new Tray(nativeImage.createFromPath(trayIcon))

  // 图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('Tesco商城后台管理系统');

  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);

  // 单击右下角小图标显示应用
  appTray.on('click', function () {
    mainWindow.show();
  })
}


function createWindow() {
  // 创建窗口对象
  mainWindow = new BrowserWindow({
    width: 1200, // 初始化宽度
    height: 800, // 初始化高度
    minWidth: 800, // 最小宽度
    minHeight: 400, // 最小高度
    autoHideMenuBar: false, // 自动隐藏菜单栏
    webPreferences: { // 网页功能的设置
      nodeIntegration: true // 是否集成Node
    }
  })

  // 打开窗口页面
  mainWindow.loadFile('dist/index.html') // 打开本地html文件
  // mainWindow.loadURL('https://www.baidu.com/'); // 打开外链

  // 最小化到托盘
  trayMenu()

  // 窗口关闭时触发
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}


// 监听初始化方法
app.on('ready', () => {
  // 自定义菜单栏
  setWindowMenu()
  // 创建窗口
  createWindow()
})


// 监听窗口右上角关闭功能
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


// 监听活动事件
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
