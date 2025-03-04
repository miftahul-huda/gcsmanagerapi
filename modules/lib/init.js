class InitApp
{
    static async loadEnvironmentVariables()
    {
        console.log("load environment variables")
        try
        {
            let url = `${process.env.configurationUrl}/env/${process.env.appID}`;
            console.log(url)
            let result = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ apiKey: process.env.apiKey })
            })
            let data = await result.json();

            if(data.success)
            {
                let items = data.payload;
                if(items != null)
                {
                    items.map((item)=>{
                        process.env[item.key] = item.value;
                    })
                }
            }
            else 
                console.error(data);

        }
        catch(e)
        {
            console.error(e)
        }
    }
}

module.exports = InitApp;