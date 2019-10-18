# For GCP Cache Utility API

# Request Parameter
Content-Type : "application/json"

- Retrieve Cache
  GET
   - url parameter
      - identify : Signed Identify
      - type     : Cache Type
      - key      : Key (Optional)

- Create/Append/Delete Cache
  POST
```Body 
 {
    identify : Identify,
    action : enum[CREATE/APPEND/DELETE/REMOVE]
    type : type,
    key : key (Optional)
    data : data (Create / Append / Delete only)
}
```

Response
```
{
    code : "000",
    data : ""
}
```
Failure case
If not fulfill data : Bad request


# Setup
Require a .env file and credential.json which is download from Google Cache API

* .env
```
REDIS_PORT=
REDIS_HOST=
REDIS_PASS=
```
# Deployment
* Local Simulator  (With functions-framework)
    npm star
