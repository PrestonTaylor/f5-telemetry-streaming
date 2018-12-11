# Introduction

<img align="right" src="docs/logo/Telemetry-Streaming.png" width="125">

Telemetry Streaming is an iControl LX extension to stream telemetry from BIG-IP(s) to analytics consumers such as the following.

- Splunk
- Azure Log Analytics
- AWS CloudWatch
- AWS S3
- Graphite

## Contents

- [Overview](#overview)
- [Configuration Examples](#configuration-examples)
- [REST API Endpoints](#rest-api-endpoints)
- [Data tracer](#data-tracer)
- [Output Example](#output-example)
- [Container](#container)

## Overview

The telemetry streaming design accounts for a number of key components, including ***System Poller***, ***Event Listener*** and ***Consumer***.  Those are described in more detail below.

### System Poller

Definition: Polls a system on a defined interval for information such as device statistics, virtual server statistics, pool statistics and much more.

### Event Listener

Definition: Provides a listener, currently TCP, that can accept events in a specic format and process them.

Event Format: ```key1="value",key2="value"```

### Consumer

Definition: Accepts information from disparate systems and provides the tools to process that information.  In the context of Telemetry Streaming this simply means providing a mechanism by which to integrate with existing analytics products.

## Configuration examples

### Basic

`POST /mgmt/shared/telemetry/declare`

```json
{
    "class": "Telemetry",
    "My_Poller": {
        "class": "Telemetry_System_Poller",
        "interval": 60
    },
    "My_Listener": {
        "class": "Telemetry_Listener",
        "port": 6514
    },
    "My_Consumer": {
        "class": "Telemetry_Consumer",
        "type": "Splunk",
        "host": "192.0.2.1",
        "protocol": "http",
        "port": "8088",
        "passphrase": {
            "cipherText": "apikey"
        }
    }
}
```

### Splunk

Website: [https://www.splunk.com](https://www.splunk.com).

Required information:

- Host: The address of the Splunk instance that runs the HTTP event collector (HEC).
- Protocol: Check if TLS is enabled within the HEC settings (Settings > Data Inputs > HTTP Event Collector).
- Port: Default is 8088, this can be configured within the Global Settings section of the Splunk HEC.
- API Key: An API key must be created and provided in the passphrase object of the declaration, refer to Splunk documentation for the correct way to create an HEC token.

Note: More information about using the HEC can be found on the Splunk website [here](http://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector).

```json
{
    "My_Consumer": {
        "class": "Telemetry_Consumer",
        "type": "Splunk",
        "host": "192.0.2.1",
        "protocol": "http",
        "port": "8088",
        "passphrase": {
            "cipherText": "apikey"
        }
    }
}
```

### Azure Log Analytics

Website: [https://docs.microsoft.com/en-us/azure/azure-monitor/log-query/log-query-overview](https://docs.microsoft.com/en-us/azure/azure-monitor/log-query/log-query-overview).

Required information:

- Workspace ID: Navigate to the Log Analaytics workspace > Advanced Settings > Connected Sources to find the workspace ID.  More information [here](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/data-collector-api).
- Shared Key: Navigate to the Log Analaytics workspace > Advanced Settings > Connected Sources to find the primary key.  More information [here](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/data-collector-api).

Note: More information about using the data collector API can be found [here](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/data-collector-api).

```json
{
    "My_Consumer": {
        "class": "Telemetry_Consumer",
        "type": "Azure_Log_Analytics",
        "workspaceId": "workspaceid",
        "passphrase": {
            "cipherText": "sharedkey"
        }
    }
}
```

### AWS Cloud Watch

Website: [https://aws.amazon.com/cloudwatch](https://aws.amazon.com/cloudwatch).

Required information:

- Region: AWS region of the cloud watch resource.
- Log Group: Navigate to Cloud Watch > Logs to find the name of the log group.
- Log Stream: Navigate to Cloud Watch > Logs > Your_Log_Group_Name to find the name of the log stream.
- Access Key: Navigate to IAM > Users to find the access key.
- Secret Key: Navigate to IAM > Users to find the secret key.

Note: More information about creating and using IAM roles can be found [here](https://aws.amazon.com/iam).

```json
{
    "My_Consumer": {
        "class": "Telemetry_Consumer",
        "type": "AWS_CloudWatch",
        "region": "us-west-1",
        "logGroup": "f5telemetry",
        "logStream": "default",
        "username": "accesskey",
        "passphrase": {
            "cipherText": "secretkey"
        }
    }
}
```

### AWS S3

Website: [https://aws.amazon.com/s3](https://aws.amazon.com/s3).

Required information:

- Region: AWS region of the S3 bucket.
- Bucket: Navigate to S3 to find the name of the bucket.
- Access Key: Navigate to IAM > Users to find the access key.
- Secret Key: Navigate to IAM > Users to find the secret key.

Note: More information about creating and using IAM roles can be found [here](https://aws.amazon.com/iam).

```json
{
    "My_Consumer": {
        "class": "Telemetry_Consumer",
        "type": "AWS_S3",
        "region": "us-west-1",
        "bucket": "bucketname",
        "username": "accesskey",
        "passphrase": {
            "cipherText": "secretkey"
        }
    }
}
```

### Graphite

Website: [https://graphiteapp.org](https://graphiteapp.org).

Required information:

- Host: The address of the Graphite system.
- Protocol: Check Graphite documentation for configuration.
- Port: Check Graphite documentation for configuration.

Note: More information about installing Graphite can be found [here](https://graphite.readthedocs.io/en/latest/install.html).

Note: More information about Graphite events can be found [here](https://graphite.readthedocs.io/en/latest/events.html).

```json
{
    "My_Consumer": {
        "class": "Telemetry_Consumer",
        "type": "Graphite",
        "host": "192.0.2.1",
        "protocol": "http",
        "port": "80"
    }
}
```

### 2 Consumers

```json
{
    "class": "Telemetry",
    "My_Poller": {
        "class": "Telemetry_System_Poller",
        "interval": 60
    },
    "My_Listener": {
        "class": "Telemetry_Listener",
        "port": 6514
    },
    "My_Consumer": {
        "class": "Telemetry_Consumer",
        "type": "Azure_Log_Analytics",
        "host": "workspaceid",
        "passphrase": {
            "cipherText": "sharedkey"
        }
    },
    "My_Second_Consumer": {
        "class": "Telemetry_Consumer",
        "type": "Splunk",
        "host": "192.0.2.1",
        "protocol": "http",
        "port": "8088",
        "passphrase": {
            "cipherText": "apikey"
        }
    }
}
```

### External system (BIG-IP)

```json
{
    "My_Poller": {
        "class": "Telemetry_System_Poller",
        "interval": 60,
        "host": "192.0.2.1",
        "port": 443,
        "username": "myuser",
        "passphrase": {
            "cipherText": "mypassphrase"
        }
    }
}
```

### Container passphrase handling

```json
{
    "passphrase": {
        "environmentVar": "MY_SECRET_ENV_VAR"
    }
}
```

## REST API Endpoints

### Base endpoint

- Telemetry's base URI is **mgmt/shared/telemetry**
- Allowed **Content-Type** for *POST* requests is **application/json**. Otherwise HTTP code 415 **Unsupported Media Type** will be returned.
- Response is valid JSON data.

Request example:

```bash
curl -v -u admin:<admin_password> -X GET http://localhost:8100/mgmt/shared/telemetry/info
```

Output:

```json
{"nodeVersion":"v4.6.0","version":"1.0.0","release":"2","schemaCurrent":"1.0.0","schemaMinimum":"1.0.0"}
```

#### Response

As mentioned above - response is valid JSON data. When response is *HTTP 200* - everything went well, response body - JSON data.

When response code is other than 2xx then response body in general will looks like following object:

```json
{
    code: ERROR_CODE, // number
    message: "ERROR_MESSAGE" // string
}
```

Additional properties might be added (depends on error type).

### Info

**<base_endpoint>/info** - endpoint to retrieve information about application.
Allowed HTTP method - **GET**.
Output:

```json
{
    "nodeVersion": "v4.6.0",
    "version": "1.0.0",
    "release": "2",
    "schemaCurrent": "1.0.0",
    "schemaMinimum": "1.0.0"
}
```

### Declare configuration

**<base_endpoint>/declare** - endpoint to declare configuration.
Allowed HTTP method - **POST**.
Request body - valid JSON object. For example see [Configuration Example](#configuration-example).

### System poller

**<base_endpoint>/systempoller/<pollerName>** - endpoint to retrieve data from configured poller.
Allowed HTTP method - **GET**.
Useful for demo or to check if poller was able to connect to device.
**pollerName** should match the name of one of configured pollers.
Otherwise *HTTP 404* will be returned. For output example see [System Info](#system-info).

## Data tracer

Tracer is useful for debug because it dumps intermediate data to file.
Default location for files is **/var/tmp/telemetry**
Each config object has 'tracer' property. Possible values are:

- *false* - tracer disabled
- *true* - tracer enabled, file name will be **DEFAULT_LOCATION/OBJ_TYPE.OBJ_NAME**
- *string* - custom path to file to steam data to

## Output Example

### System Info

```json
{
    "hostname": "hostname",
    "version": "14.0.0.1",
    "versionBuild": "0.0.2",
    "location": "Seattle",
    "description": "My BIG-IP description",
    "marketingName": "BIG-IP Virtual Edition",
    "platformId": "Z100",
    "chassisId": "6743d724-7b83-a34b-62d42aa19ad8",
    "baseMac": "00:0d:3a:36:c2:8d",
    "callBackUrl": "https://10.0.1.4",
    "configReady": "yes",
    "licenseReady": "yes",
    "provisionReady": "yes",
    "syncMode": "standalone",
    "syncColor": "green",
    "syncStatus": "Standalone",
    "syncSummary": " ",
    "failoverStatus": "ACTIVE",
    "failoverColor": "green",
    "deviceTimestamp": "2018-11-16T00:40:18Z",
    "cpu": 4,
    "memory": 51,
    "tmmCpu": 1,
    "tmmMemory": 10,
    "tmmTraffic": {
        "clientSideTraffic.bitsIn": 22020094176,
        "clientSideTraffic.bitsOut": 66095376960
    },
    "diskStorage": {
        "/": {
            "1024-blocks": "436342",
            "Capacity": "55%"
        },
        "/dev/shm": {
            "1024-blocks": "7181064",
            "Capacity": "9%"
        },
        "/config": {
            "1024-blocks": "3269592",
            "Capacity": "20%"
        },
        "/usr": {
            "1024-blocks": "4136432",
            "Capacity": "83%"
        },
        "/var": {
            "1024-blocks": "3096336",
            "Capacity": "33%"
        },
        "/shared": {
            "1024-blocks": "20642428",
            "Capacity": "3%"
        },
        "/var/log": {
            "1024-blocks": "3023760",
            "Capacity": "8%"
        },
        "/appdata": {
            "1024-blocks": "25717852",
            "Capacity": "4%"
        },
        "/shared/rrd.1.2": {
            "1024-blocks": "7181064",
            "Capacity": "1%"
        },
        "/var/run": {
            "1024-blocks": "7181064",
            "Capacity": "1%"
        },
        "/var/tmstat": {
            "1024-blocks": "7181064",
            "Capacity": "1%"
        },
        "/var/prompt": {
            "1024-blocks": "4096",
            "Capacity": "1%"
        },
        "/var/apm/mount/apmclients-7170.2018.627.21-3.0.iso": {
            "1024-blocks": "298004",
            "Capacity": "100%"
        },
        "/var/loipc": {
            "1024-blocks": "7181064",
            "Capacity": "0%"
        },
        "/mnt/sshplugin_tempfs": {
            "1024-blocks": "7181064",
            "Capacity": "0%"
        }
    },
    "diskLatency": {
        "sda": {
            "rsec/s": "6.41",
            "wsec/s": "189.75"
        },
        "sdb": {
            "rsec/s": "1.01",
            "wsec/s": "0.00"
        },
        "dm-0": {
            "rsec/s": "0.00",
            "wsec/s": "0.00"
        },
        "dm-1": {
            "rsec/s": "0.18",
            "wsec/s": "97.72"
        },
        "dm-2": {
            "rsec/s": "0.27",
            "wsec/s": "30.26"
        },
        "dm-3": {
            "rsec/s": "0.27",
            "wsec/s": "26.19"
        },
        "dm-4": {
            "rsec/s": "0.02",
            "wsec/s": "0.06"
        },
        "dm-5": {
            "rsec/s": "0.25",
            "wsec/s": "3.03"
        },
        "dm-6": {
            "rsec/s": "3.06",
            "wsec/s": "0.00"
        },
        "dm-7": {
            "rsec/s": "0.07",
            "wsec/s": "0.09"
        },
        "dm-8": {
            "rsec/s": "1.25",
            "wsec/s": "32.40"
        }
    },
    "networkInterfaces": {
        "1.1": {
            "counters.bitsIn": 66541031568,
            "counters.bitsOut": 22639094120,
            "status": "up"
        },
        "1.2": {
            "counters.bitsIn": 2400,
            "counters.bitsOut": 18240,
            "status": "up"
        },
        "mgmt": {
            "counters.bitsIn": 8638870752,
            "counters.bitsOut": 5048056112,
            "status": "up"
        }
    },
    "provisionState": {
        "afm": {
            "level": "nominal"
        },
        "am": {
            "level": "none"
        },
        "apm": {
            "level": "nominal"
        },
        "asm": {
            "level": "nominal"
        },
        "avr": {
            "level": "none"
        },
        "dos": {
            "level": "none"
        },
        "fps": {
            "level": "none"
        },
        "gtm": {
            "level": "none"
        },
        "ilx": {
            "level": "none"
        },
        "lc": {
            "level": "none"
        },
        "ltm": {
            "level": "nominal"
        },
        "pem": {
            "level": "none"
        },
        "sslo": {
            "level": "none"
        },
        "swg": {
            "level": "none"
        },
        "urldb": {
            "level": "none"
        }
    },
    "virtualServerStats": {
        "/Common/app.app/app_vs": {
            "clientside.bitsIn": 14561768,
            "clientside.bitsOut": 58749616,
            "clientside.curConns": 0,
            "destination": "10.0.2.10:80",
            "status.availabilityState": "available",
            "status.enabledState": "enabled"
        },
        "/Sample_01/A1/serviceMain": {
            "clientside.bitsIn": 0,
            "clientside.bitsOut": 0,
            "clientside.curConns": 0,
            "destination": "10.0.1.10:80",
            "status.availabilityState": "offline",
            "status.enabledState": "enabled"
        }
    },
    "poolStats": {
        "/Common/app.app/app_pool": {
            "members": {
                "/Common/216.58.217.36:80": {
                    "addr": "216.58.217.36",
                    "port": 80,
                    "serverside.bitsIn": 9345128,
                    "serverside.bitsOut": 36115312,
                    "serverside.curConns": 0,
                    "status.availabilityState": "available",
                    "status.enabledState": "enabled",
                    "status.statusReason": "Pool member is available"
                }
            }
        },
        "/Sample_01/A1/web_pool": {
            "members": {
                "/Sample_01/192.0.1.10:80": {
                    "addr": "192.0.1.10",
                    "port": 80,
                    "serverside.bitsIn": 0,
                    "serverside.bitsOut": 0,
                    "serverside.curConns": 0,
                    "status.availabilityState": "offline",
                    "status.enabledState": "enabled",
                    "status.statusReason": "Pool member has been marked down by a monitor"
                },
                "/Sample_01/192.0.1.11:80": {
                    "addr": "192.0.1.11",
                    "port": 80,
                    "serverside.bitsIn": 0,
                    "serverside.bitsOut": 0,
                    "serverside.curConns": 0,
                    "status.availabilityState": "offline",
                    "status.enabledState": "enabled",
                    "status.statusReason": "Pool member has been marked down by a monitor"
                }
            }
        }
    },
    "ltmPolicyStats": {
        "/Common/example_policy": {
            "invoked": 0,
            "succeeded": 0,
            "actions": {
                "default:0": {
                    "invoked": 0,
                    "succeeded": 0
                },
                "rule_1:0": {
                    "invoked": 0,
                    "succeeded": 0
                }
            }
        }
    },
    "tlsCerts": {
        "ca-bundle.crt": {
            "expirationDate": 1893455999,
            "expirationString": "Dec 31 23:59:59 2029 GMT",
            "issuer": "CN=Starfield Services Root Certificate Authority,OU=http://certificates.starfieldtech.com/repository/,O=Starfield Technologies, Inc.,L=Scottsdale,ST=Arizona,C=US",
            "subject": "CN=Starfield Services Root Certificate Authority,OU=http://certificates.starfieldtech.com/repository/,O=Starfield Technologies, Inc.,L=Scottsdale,ST=Arizona,C=US"
        },
        "default.crt": {
            "email": "root@localhost.localdomain",
            "expirationDate": 1854983224,
            "expirationString": "Oct 12 17:07:04 2028 GMT",
            "issuer": "emailAddress=root@localhost.localdomain,CN=localhost.localdomain,OU=IT,O=MyCompany,L=Seattle,ST=WA,C=US",
            "subject": "emailAddress=root@localhost.localdomain,CN=localhost.localdomain,OU=IT,O=MyCompany,L=Seattle,ST=WA,C=US"
        },
        "f5-ca-bundle.crt": {
            "expirationDate": 1922896554,
            "expirationString": "Dec  7 17:55:54 2030 GMT",
            "issuer": "CN=Entrust Root Certification Authority - G2,OU=(c) 2009 Entrust, Inc. - for authorized use only,OU=See www.entrust.net/legal-terms,O=Entrust, Inc.,C=US",
            "subject": "CN=Entrust Root Certification Authority - G2,OU=(c) 2009 Entrust, Inc. - for authorized use only,OU=See www.entrust.net/legal-terms,O=Entrust, Inc.,C=US"
        },
        "f5-irule.crt": {
            "email": "support@f5.com",
            "expirationDate": 1815944413,
            "expirationString": "Jul 18 21:00:13 2027 GMT",
            "issuer": "emailAddress=support@f5.com,CN=support.f5.com,OU=Product Development,O=F5 Networks,L=Seattle,ST=Washington,C=US",
            "subject": "emailAddress=support@f5.com,CN=support.f5.com,OU=Product Development,O=F5 Networks,L=Seattle,ST=Washington,C=US"
        }
    }
}
```

### Events (Logs)

#### LTM Request Log

Create LTM Request Log Profile:

- Create Pool (tmsh): ```create ltm pool telemetry-local monitor tcp members replace-all-with { 192.0.2.1:6514 }``` - Note: Replace example address with valid listener address, for example the mgmt IP.
- Create Profile (tmsh): ```create ltm profile request-log telemetry-test request-log-pool telemetry-local request-log-protocol mds-tcp request-log-template event_source=\"request_logging\",hostname=\"$BIGIP_HOSTNAME\",client_ip=\"$CLIENT_IP\",server_ip=\"$SERVER_IP\",http_method=\"$HTTP_METHOD\",http_uri=\"$HTTP_URI\",virtual_name=\"$VIRTUAL_NAME\" request-logging enabled``` - Note: If creating from the GUI the ```\``` are not required.

```json
{
    "event_source":"request_logging",
    "hostname":"hostname",
    "client_ip":"177.47.192.42",
    "server_ip":"",
    "http_method":"GET",
    "http_uri":"/",
    "virtual_name":"/Common/app.app/app_vs"
}
```

#### AFM Log

TBD

#### ASM Log

```json
{
    "hostname":"hostname",
    "management_ip_address":"10.0.1.4",
    "management_ip_address_2":"",
    "http_class_name":"/Common/app.app/app_policy",
    "web_application_name":"/Common/app.app/app_policy",
    "policy_name":"/Common/app.app/app_policy",
    "policy_apply_date":"2018-11-19 22:17:57",
    "violations":"Evasion technique detected",
    "support_id":"1730614276869062795",
    "request_status":"blocked",
    "response_code":"0",
    "ip_client":"50.206.82.144",
    "route_domain":"0",
    "method":"GET",
    "protocol":"HTTP",
    "query_string":"",
    "x_forwarded_for_header_value":"50.206.82.144",
    "sig_ids":"",
    "sig_names":"",
    "date_time":"2018-11-19 22:34:40",
    "severity":"Critical",
    "attack_type":"Detection Evasion,Path Traversal",
    "geo_location":"US",
    "ip_address_intelligence":"N/A",
    "username":"N/A",
    "session_id":"f609d8a924419638",
    "src_port":"49804",
    "dest_port":"80",
    "dest_ip":"10.0.2.10",
    "sub_violations":"Evasion technique detected:Directory traversals",
    "virus_name":"N/A",
    "violation_rating":"3",
    "websocket_direction":"N/A",
    "websocket_message_type":"N/A",
    "device_id":"N/A",
    "staged_sig_ids":"",
    "staged_sig_names":"",
    "threat_campaign_names":"",
    "staged_threat_campaign_names":"",
    "blocking_exception_reason":"N/A",
    "captcha_result":"not_received",
    "uri":"/directory/file",
    "fragment":"",
    "request":"GET /admin/..%2F..%2F..%2Fdirectory/file HTTP/1.0\\r\\nHost: host.westus.cloudapp.azure.com\\r\\nConnection: keep-alive\\r\\nCache-Control: max-age"
}
```

#### APM Log

TBD

## Container

This project builds a container, here are the current steps to build and run that container. Note: Additional steps TBD around pushing to docker hub, etc.

Note: Currently this is building from local node_modules, src, etc.  This should change to using the RPM package.

Build: ```docker build . -t f5-telemetry``` Note: From root folder of this project

Run: ```docker run --rm -d -p 443:443/tcp -p 6514:6514/tcp -e MY_SECRET_ENV_VAR='mysecret' f5-telemetry:latest```

Attach Shell: ```docker exec -it <running container name> /bin/sh```