/**
 * some function
 */


/**
 * @param {int} time sleep time(ms)
 */
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * @param {Date} time time string
 */
function TimeFormater(time) {
    let d = new Date(time);
    if (d instanceof Date && !isNaN(d.getTime()))
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    else
        return '';
}

/**
 * @param {Object List} items
 * check if the items contain the item that clush exist data
 */
function checkClush(items) {
    for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < myApp.tableData.length; j++) {
            if (items[i].code == myApp.tableData[j].code) {
                return true
            }
        }
    }
    return false
}

/**
 * for UI refresh
 */
function refreshUI() {
    ipcRender.send('get-all-data', '')
    myApp.loading = true
}

/**
 * Vue code here
 */
let myApp = new Vue({
    el: '#app',
    data: {
        // add a new students, and it's information will be binded to object newStudentform
        newStudentform: {
            code: '',
            name: '',
            sex: '',
            phone: '',
            email_address: '',
            major: '',
            age: '',
            address: '',
            date: '',
            editAvailable: false
        },
        // edit an existed students, 
        // and it's information will be binded to object newStudentform
        // it's id will be auto filled 
        editStudentform: {
            id: '',
            code: '',
            name: '',
            sex: '',
            phone: '',
            email_address: '',
            major: '',
            age: '',
            address: '',
            date: '',
            editAvailable: false
        },
        // search form ,stored the search column, it was cross-used
        searchForm: {
            code: '',
            name: '',
            phone: '',
        },
        // this var was binded to show table
        tableData: [],
        // to show loading or not
        loading: true,
        // stored the selected row index
        selectRow: [],
        // show mode 
        showInShort: true,
        // set the result-set to show
        showSearchResult: false,
        // decide that if the add operation's form show or not
        dialogNewFormVisible: false,
        dialogEditFormVisible: false,
        dialogSearchByNameFormVisible: false,
        dialogSearchByCodeFormVisible: false,
        dialogSearchByPhoneFormVisible: false,
        // if only select one row, could only edit one row once
        editAvailable: false,
        // form label width 
        formLabelWidth: '120px',
        // control the dom height
        winHeight: '750px'
    },
    methods: {
        /**
         * @param {Object} row the double click row
         * @param {*} column 
         * @param {*} event 
         * set that row to edited status
         */
        handleEdit(row, column, event) {
            row.editAvailable = true;
        },
        /**
         * @param {Array} data the selected rows
         * check if could edit or not
         */
        handleSelectionChange(data) {
            this.selectRow = [];
            if (data.length > 0) {
                data.forEach((item, index) => {
                    this.selectRow.push(this.tableData.indexOf(item));
                })
            }
            if (data.length == 1) {
                this.editAvailable = true;
                this.editStudentform.id = data[0].id;
                this.editStudentform.code = data[0].code;
                this.editStudentform.name = data[0].name;
                this.editStudentform.sex = data[0].sex;
                this.editStudentform.phone = data[0].phone;
                this.editStudentform.email_address = data[0].email_address;
                this.editStudentform.major = data[0].major;
                this.editStudentform.age = data[0].age;
                this.editStudentform.address = data[0].address;
                this.editStudentform.date = data[0].date;
                this.editStudentform.editAvailable = false;
            } else {
                this.editAvailable = false;
            }
        },
        /**
         * return the hightlight css
         */
        selectedRow({
            row,
            rowIndex
        }) {
            if (this.selectRow.includes(rowIndex)) {
                return {
                    "background-color": "rgba(185,221,249,0.75)"
                }
            }
        },
        /**
         * return the tag type
         */
        tagType(major) {
            if (major === '计算机应用') return 'primary';
            if (major === '信息安全') return 'success';
            if (major === '电子信息') return 'info';
            if (major === '网络技术') return 'danger';
        },
        /**
         * table filter
         * value has been seted to 'major'
         * column.property has been seted to 'major'
         */
        filterMajor(value, row, column) {
            const property = column['property'];
            return row[property] === value;
        },
        /**
         * like above
         */
        filterSex(value, row, column) {
            return row[column['property']] === value;
        },
        // just reset sex filter
        resetSexFilter() {
            this.$refs.Table.clearFilter('sex');
        },
        // just reset majro filter
        resetMajorFilter() {
            this.$refs.Table.clearFilter('major');
        },
        // reset all the filter
        resetAllFilter() {
            this.$refs.Table.clearFilter();
        },
        // switch show mode, it depends on myApp.showInShort
        showModeChange() {
            if (this.showInShort) {
                ipcRender.send('win-maximize', '');
                this.winHeight = '950px';
            } else {
                ipcRender.send('win-unmaximize', '');
                this.winHeight = '750px'
            }
            this.showInShort = !this.showInShort;
        },
        // time formater, to beautify the time string
        formatTime(date) {
            return TimeFormater(date);
        },
        // enable edit form and edit
        edit() {
            if (this.editAvailable) {
                this.dialogEditFormVisible = true;
            } else {
                this.$message.error('请选择一条数据以编辑！');
            }
        },
        // edit the information in the table, and when lose focus, it will call this function to update to database
        // it may take little time
        updateData(scope) {
            scope.row.editAvailable = false;
            let d = new Date(scope.row.date);
            scope.row.age = new Date().getFullYear() - d.getFullYear();
            this.loading = true;
            ipcRender.send('updata-data', scope.row)
        },
        // this function will be called by edit-form, and update it's information
        updateByID() {
            // update the data and fresh ui
            this.loading = true
            let data = this.editStudentform;
            let d = new Date(data.date);
            data.age = new Date().getFullYear() - d.getFullYear();
            ipcRender.send('updata-data', data)
        },
        // new form call this function
        insertData() {
            // insert the data and fresh ui
            this.loading = true
            let data = this.newStudentform;
            let d = new Date(data.date);
            data.age = new Date().getFullYear() - d.getFullYear();
            ipcRender.send('insert-data', data)
        },
        // menu call this function
        deleteSelectedItem() {
            if (this.selectRow.length === 0) {
                this.$message.error('至少选择一条数据以删除！')
            }
            // use promise to wait user confirm
            this.$confirm('删除操作不可逆，确认删除所选的同学资料？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let items = []
                this.selectRow.forEach((value, index) => {
                    items.push(this.$refs.Table.data[value].id)
                })
                ipcRender.send('delete-items', items);
                refreshUI()
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                })
            })
        },
        // search function list
        // it will construct a filter automaticly, and post it to main process
        searchByName() {
            if (this.searchForm.name == "") {
                this.$message.error('请输入搜索姓名！');
            } else {
                this.loading = true
                let filter = {
                    name: this.searchForm.name
                };
                ipcRender.send('get-filter-data', filter)
            }
        },
        searchByCode() {
            if (this.searchForm.code == "") {
                this.$message.error("请输入搜索学号！");
            } else {
                this.loading = true
                let filter = {
                    code: this.searchForm.code
                }
                ipcRender.send('get-filter-data', filter)
            }
        },
        searchByPhone() {
            if (this.searchForm.phone == "") {
                this.$message.error("请输入搜索电话！");
            } else {
                this.loading = true
                let filter = {
                    phone: this.searchForm.phone
                }
                ipcRender.send('get-filter-data', filter)
            }
        },
        // fresh the ui and show all the data
        fresh() {
            refreshUI()
            this.showSearchResult = false
        },
        // backup files, this will let main process call a SaveAs dialog
        // in main.js see more detail
        backupFile() {
            if (this.selectRow.length == 0) {
                this.$message.error("请选择需要备份的数据！")
            } else {
                this.loading = true
                let items = []
                this.selectRow.forEach((value, index) => {
                    items.push(this.$refs.Table.data[value])
                })
                ipcRender.send('backup-files', items)
            }
        },
        // recovery data, call a OpenFile dialog
        // also in main.js
        recovery() {
            this.loading = true
            ipcRender.send('recovery', '')
        }
    },
});

/**
 * ipc here
 */

const ipcRender = require('electron').ipcRenderer;

/**
 * get the data, and show it into the screen
 * also will judge if it is search result
 * request all data or filtered data operation message route: 
 * Render Process func[refreshUI|searchByName|searchByCode|searchByPhone] -> Main Process event[get-all-data|get-filter-data] -> Render Process event[recv-data]
 */
ipcRender.on('recv-data', (event, message) => {
    myApp.tableData = message
    if (myApp.searchForm.name != "" || myApp.searchForm.code != "" || myApp.searchForm.phone != "") {
        myApp.searchForm.name = ""
        myApp.searchForm.code = ""
        myApp.searchForm.phone = ""
        myApp.showSearchResult = true
        myApp.dialogSearchByNameFormVisible = false;
        myApp.dialogSearchByCodeFormVisible = false;
        myApp.dialogSearchByPhoneFormVisible = false;
    }
    sleep(500).then(() => {
        myApp.loading = false
    })
})

/**
 * when insert operation done
 * this event will show message successful or not
 * insert operation message route: Render Process func[insertData] -> Main Process event[insert-data] -> Render Process event[insert-status]
 */
ipcRender.on('insert-status', (event, message) => {
    if (message == 'successful') {
        myApp.newStudentform.code = ''
        myApp.newStudentform.name = ''
        myApp.newStudentform.sex = ''
        myApp.newStudentform.phone = ''
        myApp.newStudentform.email_address = ''
        myApp.newStudentform.major = ''
        myApp.newStudentform.age = ''
        myApp.newStudentform.address = ''
        myApp.newStudentform.data = ''
        myApp.newStudentform.editAvailable = false
        myApp.dialogNewFormVisible = false;
        myApp.$message.success('添加成功！')
        refreshUI()
    } else if (message == 'error_code') {
        myApp.$message.error('数据库中已存在该学生编号')
        myApp.loading = false
    }
})

/**
 * update event done
 * update operation message route: Render Process func[updateByID|updateData] -> Main Process event[updata-data] -> Render Process event[update-status]
 */
ipcRender.on('update-status', (event, message) => {
    if (message == 'successful') {
        myApp.$message.success('修改成功！')
        myApp.dialogEditFormVisible = false
        myApp.loading = false
        refreshUI()
    } else if (message == 'error_code') {
        myApp.$message.error('数据库中已存在该学生编号!')
    }
})

/**
 * backuo event done
 * backup operation message route: Render Process func[backupFile] -> Main Process event[backup-files] -> Render Process event[backup-status]
 */
ipcRender.on('backup-status', (event, message) => {
    if (message == 'successful') {
        myApp.$message.success('备份成功！')
        refreshUI()
    } else if (message == 'error') {
        myApp.$message.error('备份异常，请检查是否有其它程序占用了文件！')
    } else if (message == 'cancel') {
        myApp.$message.info('用户取消备份操作')
    }
    myApp.loading = false
})

/**
 * recovery event done
 * but not write to database
 * if the data not clushed, then write it into database
 * if the data clushed, ask user to decide overlap it or not
 * recovery operation message route : Render Process func[recovery] -> Mian Process event[recovery] -> Render Process event[recovery-status] 
 *                                  -> Main Process event[overlap-data|skip-data|recovery-data] -> Render Process event[recovery-done]
 */
ipcRender.on('recovery-status', (event, message) => {
    if (message == 'error') {
        myApp.$message.error('无法读取数据，请检查是否有其它程序占用了文件！')
    } else if (message == 'cancel') {
        myApp.$message.info('用户取消了恢复操作')
    } else {
        if (checkClush(message)) {
            myApp.$confirm('发现冲突数据，使用备份数据覆盖当前数据？', '提示', {
                confirmButtonText: '全部覆盖',
                cancelButtonText: '不覆盖',
                type: 'warning'
            }).then(() => {
                ipcRender.send('overlap-data', message)
            }).catch(() => {
                ipcRender.send('skip-data', message)
            })
        } else {
            ipcRender.send('recovery-data', message)
        }
    }
    myApp.loading = false
})

ipcRender.on('recovery-done', (event, message) => {
    refreshUI()
})


refreshUI()

