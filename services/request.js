const axios = require("axios")
const fs = require('fs');
const Service = require('../models/services'); // Import the Mongoose model

// const sendReqBuyTym = async (link, quantity) => {
//     try {
//         let data = JSON.stringify({
//             "package_name": "tiktok_like_v12",
//             "quantity": `${quantity}`,
//             "object_id": `${link}`,
//             "notes": "",
//             "token_": "h1mnVOuInoUdOonLGMj7mZhk3fL38DQpF8RpneFy"
//         });

//         // NDgwNQ==4f02624d4643b9c6ede9d39faMTYxNzk3OTc1Mg==
//         let config = {
//             method: 'post',
//             maxBodyLength: Infinity,
//             url: 'https://dichvu.baostar.pro/api/tiktok-like/buy',
//             headers: {
//                 'sec-ch-ua-platform': '"Windows"',
//                 '_tokene': 'oZPO3cnD1runqI6dsdDdv7uu3HCmk6HNlNW/p5m2iql/cbTR3di62g==',
//                 '_token': 'h1mnVOuInoUdOonLGMj7mZhk3fL38DQpF8RpneFy',
//                 'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
//                 'sec-ch-ua-mobile': '?0',
//                 'ax': 'icvN59XazeuQnZGfptO5uuilw56tnY+sxdnCxMW2',
//                 's-ide': 'pLzZ5dTFtKpqinFpmanHwsCy5od6qpvL2bLivqfpkYeKqdSk28HYrA==',
//                 'api-key': 'EEEAh6bI5sHFnq9tn2lrmJOj16iXpmybcpyYxtPYrcWlcp+ahra658HuzKWIjZxqr8issA==',
//                 'kb': 'PilxbflyWdXfDrJGtDQetdVJdjOPdD',
//                 'X-Requested-With': 'XMLHttpRequest',
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
//                 'Accept': '*/*',
//                 'fp': '120904936435015018422107787467',
//                 'Content-Type': 'application/json',
//                 's-id': 'kZxvaQS81Q807HXOLQtNAqbixCoJFwXNQprClNdK',
//                 'Sec-Fetch-Site': 'same-origin',
//                 'Sec-Fetch-Mode': 'cors',
//                 'Sec-Fetch-Dest': 'empty',
//                 'host': 'dichvu.baostar.pro'
//             },
//             data: data
//         };
//         axios.request(config)
//             .then((response) => {
//                 console.log(JSON.stringify(response.data));
//             })
//             .catch((error) => {
//                 console.log(error);
//             });

//     } catch (error) {
//         console.log("🚀 ~ sendReq ~ error:", error)

//     }
// }

const sendReqBuy = async (endpoint, link, quantity, package_name, apikey) => {
    try {
        const result = await axios.post(`https://dichvu.baostar.pro${endpoint}`,
            {
                object_id: link,
                quantity: quantity,
                package_name: package_name
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apikey,
                }
            }
        );
        if (result.data) {
            console.log("Success:", result.data);
            return true;
        }
        else {
            return false;
        }
    } catch (error) {
        console.log(`🚀 ~ sendReqBuy ~ error:`, error);
        return false;
    }
}

module.exports = { sendReqBuy };

// const getAllService = async () => {
//     try {
//         // Fetch data from the API
//         const result = await axios.get(`https://dichvu.baostar.pro/api/prices`, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'api-key': 'NDgwNQ==4f02624d4643b9c6ede9d39faMTYxNzk3OTc1Mg==',
//             }
//         });

//         if (result) {
//             const services = result.data.data;

//             // Lọc ra các dịch vụ TikTok trước khi map
//             const serviceDocuments = services
//                 .filter(serviceData => serviceData.url_api.includes("tiktok"))
//                 .map(serviceData => ({
//                     url_api: serviceData.url_api,
//                     path: serviceData.path,
//                     name: serviceData.name,
//                     package: serviceData.package.map(pkg => ({
//                         name: pkg.name,
//                         package_name: pkg.package_name,
//                         price: pkg.price_per
//                     }))
//                 }));

//             if (serviceDocuments.length > 0) {
//                 try {
//                     // Lưu các dịch vụ đã lọc vào database
//                     await Service.insertMany(serviceDocuments);
//                     console.log(`All services successfully saved to the database.`);
//                 } catch (err) {
//                     console.error(`Error saving services to the database:`, err);
//                 }
//             } else {
//                 console.log("No TikTok services found to save.");
//             }
//         }

//     } catch (error) {
//         console.log("🚀 ~ getAllService ~ error:", error);
//     }
// };


// Call the function to fetch, write, and insert data
// getAllService();