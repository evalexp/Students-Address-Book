const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const crypto = require('crypto')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({
        data: []
    })
    .write();

/**
 * @param {Array} formData latest information array
 * update the data
 */
function updateByID(formData) {
    let queryItem = getDataByFilter({
        code: formData.code
    })
    if (queryItem.length != 0) {
        if (queryItem[0].id !== formData.id) {
            return 'error_code'
        }
    }
    db.get('data')
        .find({
            id: formData.id
        })
        .assign(formData)
        .write()
    delete formData.id
    /**
     * refresh id
     */
    db.get('data')
        .find({
            code: formData.code
        })
        .assign({
            id: getMD5(formData)
        })
        .write()
    return 'successful'
}

/**
 * 
 * @param {Object} formData 
 */
function updateByCode(formData) {
    db.get('data')
        .find({code: formData.code})
        .assign(formData)
        .write()
}

/**
 * Get all the data
 */
function getAllData() {
    return db.get('data').value();
}

/**
 * @param {int} delete_id the id of item which need delete
 */
function removeDataByID(delete_id) {
    db.get('data')
        .remove({
            id: delete_id
        })
        .write()
}

/**
 * @param {Object} filter filter match
 */
function getDataByFilter(filter) {
    return db.get('data')
        .filter(filter)
        .value()
}

/**
 * @param {Object} formData the newForm data object
 * return it's md5
 */
function getMD5(formData) {
    return crypto.createHash('md5').update(JSON.stringify(formData)).digest('hex')
}

/**
 * @param {Obejct} data the data of the object need to insert
 */
function insertData(data) {
    if (getDataByFilter({
            code: data.code
        }).length != 0) {
        return 'error_code'
    }
    db.get('data')
        .push(data)
        .write()
    return 'successful'
}

function getAllDataFromFile(file) {
    const bak_adapter = new FileSync(file)
    try {
        const bak_db = low(bak_adapter)
        return bak_db.get('data').value()
    } catch (error) {
        return []
    }
}

exports.updateByID = updateByID
exports.getAllData = getAllData
exports.removeDataByID = removeDataByID
exports.getDataByFilter = getDataByFilter
exports.getMD5 = getMD5
exports.insertData = insertData
exports.getAllDataFromFile = getAllDataFromFile
exports.updateByCode = updateByCode