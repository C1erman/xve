//for import JSON files
function Get(url){
    return fetch(url, {
        method : 'GET',
        headers : new Headers({
            'Content-Type' : 'application/json'
        })
    }).then(response => {
        return handlResponse(url, response);
    }).catch(error => {
        console.error(`Requset failed. Url=${url}. Message=${error}`);
        return {
            error : {
                message : 'request filed'
            }
        }
    });
}

function handlResponse(url, response){
    if(response.status < 500){
        return response.json();
    }
    else{
        console.error(`Requset failed. Url=${url}. Message=${error}`);
        return {
            error : {
                message : 'request filed'
            }
        }
    }
}
export default Get;