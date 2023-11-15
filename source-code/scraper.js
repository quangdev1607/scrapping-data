const scrapeCategory = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let page = await browser.newPage()
        console.log('>> Đang khởi động trình duyệt...');

        await page.goto(url)
        console.log(`>> Đang truy cập vào ${url}`)

        await page.waitForSelector('#webpage')
        // await page.setViewport({ width: 1920, height: 1080 });
        console.log('>> Website đã load xong');

        console.log('>> Tiến hành cào dữ liệu...')
        const dataCategories = await page.$$eval('#navbar-menu > #menu-main-menu > li', els => { // $$eval sẽ trả về một array
            dataCategories = els.map(el => {
                return {
                    category: el.querySelector('a').innerText,
                    link: el.querySelector('a').href
                }
            })
            return dataCategories
        })
        await page.close()
        console.log('>> Đã đóng tab')
        resolve(dataCategories)

    } catch (error) {
        console.log('Lỗi ở scrape category: ' + error)
        reject(error)
    }
})

//-----------------------------------------------------------------------------//

const scraper = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let newPage = await browser.newPage()
        console.log('>> Đang mở tab mới...');

        await newPage.goto(url)
        console.log(`>> Đang truy cập vào ${url}`)

        await newPage.waitForSelector('#main')
        console.log('>> Website đã load xong');

        console.log('>> Tiến hành cào dữ liệu...')
        const scrapedData = {}

        // HEADER DATA //---------------------------------------------
        const headerData = await newPage.$eval('header', el => {
            return {
                title: el.querySelector('h1').innerText,
                description: el.querySelector('p').innerText
            }
        })
        scrapedData.header = headerData

        // ITEM DETAILS //---------------------------------------------
        // get link:
        const detailLinks = await newPage.$$eval('#left-col > .section.section-post-listing ul > li', els => {
            detailLinks = els.map(el => {
                return el.querySelector('.post-meta > h3 > a').href
            })
            return detailLinks
        })
        // get detail data:
        const scrapeDetailData = (link) => new Promise(async (resolve, reject) => {
            {
                try {
                    let newDetailPage = await browser.newPage()
                    console.log('>> Đang mở tab detail mới...');

                    await newDetailPage.goto(link)
                    console.log(`Đang truy cập vào ${link}`)

                    await newDetailPage.waitForSelector('#main')
                    console.log('>> Website đã load xong');

                    console.log('>> Tiến hành cào dữ liệu...')
                    const detailDatas = { appartment: {} }

                    // IMAGES //------//------//------//------//------//------//------//
                    const imageDatas = await newDetailPage.$$eval('#left-col > article > div.post-images > div > div.swiper-wrapper > div.swiper-slide', (els) => {
                        imageDatas = els.map(el => {
                            return el.querySelector('img')?.src
                        })
                        return imageDatas.filter(i => !i === false)
                    })

                    detailDatas.appartment.images = imageDatas

                    // HEADER //------//------//------//------//------//------//------//
                    const headerData = await newDetailPage.$eval('header.page-header', el => {
                        return {
                            title: el.querySelector('h1 > a').innerText,
                            star: el.querySelector('h1 > span')?.className?.replace(/^\D+/g, ''),
                            address: el.querySelector('address').innerText,
                            attributes: {
                                price: el.querySelector('div.post-attributes > .price > span').innerText,
                                acreage: el.querySelector('div.post-attributes > .acreage > span').innerText,
                            }
                        }
                    })
                    detailDatas.appartment.header = headerData

                    // BODY DESCRIPTION//------//------//------//------//------//------//------//
                    const header = await newDetailPage.$eval('#left-col > article.the-post > section.post-main-content', el => {
                        return el.querySelector('div.section-header > h2').innerText
                    })
                    const content = await newDetailPage.$$eval('#left-col > article.the-post > section.post-main-content > div.section-content > p', els => els.map(el => el.innerText))

                    detailDatas.appartment.mainContent = {
                        header: header,
                        content: content
                    }

                    // BODY OVERVIEW//------//------//------//------//------//------//------//
                    const overviewHeader = await newDetailPage.$eval('#left-col > article.the-post > section.post-overview', el => {
                        return el.querySelector('div.section-header > h3').innerText
                    })

                    const overviewContent = await newDetailPage.$$eval('#left-col > article.the-post > section.post-overview > div.section-content > table.table > tbody > tr', els => {
                        overviewContent = els.map(el => {
                            return {
                                category: el.querySelector('td:first-child').innerText,
                                data: el.querySelector('td:nth-child(2)').innerText // hoặc xài td:last-child
                            }
                        })
                        return overviewContent
                    })

                    detailDatas.appartment.overview = {
                        header: overviewHeader,
                        content: overviewContent
                    }

                    // BODY CONTACT//------//------//------//------//------//------//------//
                    const contactHeader = await newDetailPage.$eval('#left-col > article.the-post > section.post-contact', el => {
                        return el.querySelector('div.section-header > h3').innerText
                    })

                    const contactContent = await newDetailPage.$$eval('#left-col > article.the-post > section.post-contact > div.section-content > table.table > tbody > tr', els => {
                        contactContent = els.map(el => {
                            return {
                                category: el.querySelector('td:first-child').innerText,
                                data: el.querySelector('td:nth-child(2)').innerText // hoặc xài td:last-child
                            }
                        })
                        return contactContent
                    })


                    detailDatas.appartment.contact = {
                        header: contactHeader,
                        content: contactContent
                    }


                    await newDetailPage.close()
                    console.log(`Đã đóng tab ${link} `)



                    resolve(detailDatas)

                } catch (error) {
                    console.log('Lỗi khi lấy detail data:', error)
                    reject(error)
                }
            }
        })
        const details = []
        for (let link of detailLinks) {
            const pageDetail = await scrapeDetailData(link)
            details.push(pageDetail)
        }

        scrapedData.body = details



        resolve(scrapedData)

    } catch (error) {
        console.log('Lỗi ở scrape details: ' + error)
        reject(error)

    }
})


module.exports = { scrapeCategory, scraper }