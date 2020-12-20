/**
 * init database
 */

const database = require(__dirname + "/src/nodejs/database.js")

/**
 * init window
 */

const {
    app,
    BrowserWindow,
    dialog
} = require('electron')
const ipcMain = require('electron').ipcMain
const fs = require('fs')

function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 850,
        webPreferences: {
            nodeIntegration: true,
        }
    })
    win.loadFile('index.html')

    // for view better
    ipcMain.on('win-maximize', (e, a) => {
        win.maximize();
    })

    ipcMain.on('win-unmaximize', (e, a) => {
        win.unmaximize();
    })

    // render process request all the data
    ipcMain.on('get-all-data', (event, message) => {
        win.webContents.send('recv-data', database.getAllData());
    })
    // requst to insert a data into database
    // if student's code existed, it will not insert
    ipcMain.on('insert-data', (event, message) => {
        let md5 = database.getMD5(message);
        message.id = md5;
        win.webContents.send('insert-status', database.insertData(message))
    })
    // requset tp update student's information
    ipcMain.on('updata-data', (event, message) => {
        win.webContents.send('update-status', database.updateByID(message))
    })
    // requset to delete some studnet's information
    ipcMain.on('delete-items', (event, message) => {
        message.forEach((value, index) => {
            database.removeDataByID(value)
        })
    })
    // get the data by filter
    ipcMain.on('get-filter-data', (event, message) => {
        win.webContents.send('recv-data', database.getDataByFilter(message))
    })

    // file extension filter for FileDialog
    const file_filter = [{
            name: 'Backup Files',
            extensions: ['bak', 'backup']
        },
        {
            name: 'JSON',
            extensions: ['json']
        }
    ]
    // request to backup, message are the selected student object Array to backup
    ipcMain.on('backup-files', (event, message) => {
        let savePath = dialog.showSaveDialogSync(win, {
            message: '请选择数据备份存储位置',
            title: '请选择数据备份存储位置',
            defaultPath: app.getPath('home') + '/AdressBook.bak',
            filters: file_filter
        })
        if (savePath != undefined) {
            let w_data = {
                data: message
            }
            fs.writeFile(savePath, JSON.stringify(w_data), {
                encoding: 'utf-8'
            }, err => {
                if (err) {
                    win.webContents.send('backup-status', 'error')
                } else {
                    win.webContents.send('backup-status', 'successful')
                }
            })
        } else {
            win.webContents.send('backup-status', 'cancel')
        }
    })
    // request to recovery, try to load file, and send the data to render process
    ipcMain.on('recovery', (event, message) => {
        let filePath = dialog.showOpenDialogSync(win, {
            message: '请选择本分数据存在位置',
            title: '请选择备份数据存储位置',
            defaultPath: app.getPath('home'),
            filters: file_filter
        })
        if (filePath != undefined) {
            filePath = filePath[0]
            let items = database.getAllDataFromFile(filePath)
            win.webContents.send('recovery-status', items)
        } else {
            win.webContents.send('recovery-status', 'cancel')
        }
    })

    // to check if clush
    function checkExist(it_code) {
        if (database.getDataByFilter({
                code: it_code
            }).length != 0) {
            return true
        } else {
            return false
        }
    }

    // start to write backup file's data to database, this event will overlap existed data
    ipcMain.on('overlap-data', (event, message) => {
        for (let i = 0; i < message.length; i++) {
            if (checkExist(message[i].code)) {
                database.updateByCode(message[i])
            } else {
                if (message[i].id != undefined) {
                    delete message[i].id
                }
                message[i].id = database.getMD5(message[i])
                database.insertData(message[i])
            }
        }
        win.webContents.send('insert-status', 'successful')
        win.webContents.send('recovery-done', '')
    })
    // skip exist data
    ipcMain.on('skip-data', (event, message) => {
        for (let i = 0; i < message.length; i++) {
            if (!checkExist(message[i].code)) {
                if (message[i].id != undefined) {
                    delete message[i].id
                }
                message[i].id = database.getMD5(message[i])
                database.insertData(message[i])
            }
        }
        win.webContents.send('insert-status', 'successful')
        win.webContents.send('recovery-done', '')
    })
    // no clush, just write it to datbase
    ipcMain.on('recovery-data', (event, message) => {
        for (let i = 0; i < message.length; i++) {
            if (message[i].id != undefined) {
                delete message[i].id
            }
            message[i].id = database.getMD5(message[i])
            database.insertData(message[i])
        }
        win.webContents.send('insert-status', 'successful')
        win.webContents.send('recovery-done', '')
    })

}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})