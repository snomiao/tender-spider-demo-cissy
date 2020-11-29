// 
// 作者：雪星 (snomiao@gmail.com) 于 2020-11
// 协议：本份代码遵循 BSD 协议，作者仅保留著作权，您可以自由的使用，修改源代码，也可以将修改后的代码作为开源或者专有软件再发布。
// [BSD许可协议_百度百科]( https://baike.baidu.com/item/BSD%E8%AE%B8%E5%8F%AF%E5%8D%8F%E8%AE%AE )
const fs = require('fs');
const { json2csv } = require('json-2-csv');
const pMap = require('p-map');
const got = require('got');
const h2p = require('html2plaintext');

(async function main() {
    const tasks = await 读取任务列表()
    const sites = tasks
    const mapper = async site => {
        // const {requestUrl} = await got.head(site);
        const { requestUrl, body } = await got.get(site);
        const text = h2p(body)
        const obj = 标书解析(text)
        const show = text.slice(0, 100)
        const 标书链接 = requestUrl
        return { ...obj, 标书链接 }
        // return { requestUrl, body };
    };

    const 标书信息列表 = await pMap(sites, mapper, { concurrency: 2 });
    const 标书信息列表CSV = JSON数组向CSV转换(标书信息列表);
    await fs.promises.writeFile('标书信息列表.csv', '\uFEFF' + 标书信息列表CSV);

    return result
})().then(console.log);

function JSON数组向CSV转换(jsonArray) {
    const allKeys = Object.keys(Object.fromEntries(jsonArray.flatMap(obj => Object.keys(obj)).map(key => [key, null])));
    // console.log(allKeys)
    const table = [allKeys, ...jsonArray.map(obj => allKeys.map(key => (obj[key] || '').toString()))];
    // console.log(table)
    const csv = table.map(tr => tr.map(txt => '"' + txt.replace(/"/g, '""') + '"').join(',')).join('\n');
    // console.log(csv)
    return csv;
}

async function 读取任务列表() {
    return (await fs.promises.readFile("tasks.txt", 'utf8')).trim().split(/\r\n/);
}
function 标书解析(文本) {
    const 合法字段 = ['项目名称', '招标编号', '招标人', '代理机构', '招标方式', '流标原因', '监督单位', '联系电话', '地址',
        '联系人', '招标代理', '电话', '邮箱', '主办', '标书链接', '发布时间', '阅读量', '项目编号',
        '公告发布日期', '开标日期', '中标情况', '联系方式', '合作伙伴', '项目类别', '项目地点', '技术支持', '信息维护', '业务受理']
    const gm = 文本.match(/([^：\r\n]+?)：\s*([^：\r\n\s]+)/img)
    if (!gm) return { matched: null }
    const ent = gm.map(行 => 行
        .match(/([^：\r\n]+?)：\s*([^：\r\n\s]+)/im))
        .map(m => ([属性名称处理(m[1]), 属性内容处理(m[2])]))
        .filter(([k, v]) => 合法字段.includes(k))
    return Object.fromEntries(ent)

    // 一、项目名称：黑龙江省绥化市绥棱县绥棱镇二次供水改造工程项目（二次）第一标段
    // 二、招标编号：YC20327278(ZBB)
    // 三、招标人：绥棱县自来水公司
    // 四、代理机构：亿诚建设项目管理有限公司
    // 五、招标方式：公开招标
    // 六、流标原因： 上海熊猫机械（集团）有限公司，投标报价内无专业工程暂估价报价，上海晨菲水务科技有限公司，投标报价内无材料暂估价报价、住房公积金取费费率错误，以上两家投标单位不符合招标文件评标办法前附表2.1.3款响应性评审中已标价工程量清单要求，做否决投标处理。有效投标单位不足三家，做流标处理。
    // 七、联系方式
    // 监督单位：绥棱县建筑工程指导中心
    // 联系电话：0455-4622038
    // 招 标 人：绥棱县自来水公司
    // 地    址：绥棱县
    // 联 系 人：张先生
    // 联系电话：0455-4668106
    // 招标代理：亿诚建设项目管理有限公司
    // 地    址：绥化市经济开发区管理委员会西侧商服
    // 联 系 人：杨女士
    // 电    话：0455-8397805
    // 邮    箱：yczb5559@163.com 
}

function 属性名称处理(属性名称) {
    return 属性名称
        .replace(/.*[、.,]/g, '')
        .replace(/[<!-]+/g, '')
        .replace(/\s+/g, '').trim()

}
function 属性内容处理(属性内容) {
    return 属性内容.trim()
}