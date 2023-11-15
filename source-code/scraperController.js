const scrapers = require('./scraper')
const fs = require('fs')

const scrapperController = async (browserInstance) => {
    const url = 'https://phongtro123.com/'
    const indexes = [1, 2, 3, 4]
    try {
        let browser = await browserInstance
        // gọi hàm cạo ở file s scrape
        const categories = await scrapers.scrapeCategory(browser, url)
        const selectedCategory = categories.filter((category, idx) => indexes.some(i => i === idx))

        // let result1 = await scrapers.scraper(browser, selectedCategory[0].link)
        // fs.writeFile('rentAppartment.json', JSON.stringify(result1), (err) => {
        //     if (err) console.log('Ghi data vào file json thất bại: ', err)
        //     console.log('Thêm data thành công')
        // })

        let result2 = await scrapers.scraper(browser, selectedCategory[1].link)
        fs.writeFile('rentHouse.json', JSON.stringify(result2), (err) => {
            if (err) console.log('Ghi data vào file json thất bại: ', err)
            console.log('Thêm data thành công')
        })



        await browser.close()
        console.log('>> Đã đóng trình duyệt')
    } catch (e) {
        console.log('Lỗi ở scrape controller: ' + e);
    }
}

module.exports = scrapperController