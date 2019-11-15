using KeePass.Plugins;
using KeePassLib;
using KeePassLib.Collections;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace EasyBrowserPlugin
{
    public class HTTPHandler
    {
        private IPluginHost _pHost;
        private HttpListener _server;
        private EasyBrowserPluginExt _plugin;
        private static readonly object workerLock = new object();

        public HTTPHandler(IPluginHost pHost, EasyBrowserPluginExt plugin)
        {
            _plugin = plugin;
            _pHost = pHost;
            _server = new HttpListener();
            _server.Prefixes.Add("http://localhost:34567/");
            _server.Prefixes.Add("http://localhost:34567/connectivity/");
        }

        public void Start()
        {
            _server.Start();
            _server.BeginGetContext(EndGetContext, null);
        }

        public void Stop()
        {
            _server.Stop();
        }

        private void EndGetContext(IAsyncResult ar)
        {
            try
            {
                var ctx = _server.EndGetContext(ar);
                _server.BeginGetContext(EndGetContext, null);

                lock (workerLock)
                {
                    if (ctx.Request.HttpMethod == "GET" && ctx.Request.RawUrl == "/connectivity/")
                    {
                        ctx.Response.StatusCode = _pHost.Database.IsOpen ? 200 : 401;
                        ctx.Response.OutputStream.Close();
                        return;
                    }

                    if (ctx.Request.HttpMethod != "POST")
                    {
                        ctx.Response.StatusCode = 405;
                        ctx.Response.OutputStream.Close();
                        return;
                    }

                    if (ctx.Request.RawUrl != "/")
                    {
                        ctx.Response.StatusCode = 400;
                        ctx.Response.OutputStream.Close();
                        return;
                    }

                    EncryptedMessage encReqData = null;
                    RequestData reqData = null;
                    try
                    {
                        var rawData = new StreamReader(ctx.Request.InputStream).ReadToEnd();
                        Debug.WriteLine($"Received: {rawData}");
                        encReqData = JsonConvert.DeserializeObject<EncryptedMessage>(rawData);
                    }
                    catch (Exception)
                    {
                        ctx.Response.StatusCode = 400;
                        ctx.Response.OutputStream.Close();
                        return;
                    }

                    if (encReqData == null || string.IsNullOrEmpty(encReqData.IV) || string.IsNullOrEmpty(encReqData.Message))
                    {
                        ctx.Response.StatusCode = 400;
                        ctx.Response.OutputStream.Close();
                        return;
                    }

                    reqData = CryptoHelper.DecryptMessage(encReqData, _plugin.CryptoKey);

                    if (reqData == null || string.IsNullOrEmpty(reqData.Url))
                    {
                        ctx.Response.StatusCode = 400;
                        ctx.Response.OutputStream.Close();
                        return;
                    }

                    var responseData = FindCredentials(reqData.Url);

                    var encResponseData = CryptoHelper.EncryptMessage(responseData, _plugin.CryptoKey);

                    var response = JsonConvert.SerializeObject(encResponseData);
                    var writer = new StreamWriter(ctx.Response.OutputStream);
                    writer.Write(response);
                    Debug.WriteLine($"Returned: {response}");

                    ctx.Response.StatusCode = 200;
                    writer.Close();
                    writer.Dispose();
                }
            }
            catch (HttpListenerException)
            {
                //system is terminating, so... that's right as it is ;)
            }
        }

        private ResponseData FindCredentials(string url)
        {
            var notFound = new ResponseData
            {
                Entries = new ResponseEntry[0]
            };

            if (_pHost == null)
            {
                return notFound;
            }

            if (_plugin.CryptoKey == null)
            {
                return notFound;
            }

            if (!_pHost.Database.IsOpen)
            {
                return notFound;
            }

            var cleanedSite = new UrlStripper(url);


            var sp = SearchParameters.None;
            sp.SearchString = url;
            sp.SearchInUrls = true;
            sp.SearchInTitles = true;
            sp.ExcludeExpired = true;

            var tmpResults = new PwObjectList<PwEntry>();
            _pHost.Database.RootGroup.SearchEntries(sp, tmpResults);

            while (cleanedSite.CanStrip)
            {
                var tmpRes = new PwObjectList<PwEntry>();
                sp.SearchString = cleanedSite.Strip();
                _pHost.Database.RootGroup.SearchEntries(sp, tmpRes);
                tmpResults.Add(tmpRes);
            }

            var results = new PwObjectList<PwEntry>();
            results.Add(tmpResults.Distinct().OrderBy(e => e.Strings.ReadSafe(PwDefs.TitleField)).ToList());

            if (results.UCount == 0)
            {
                return notFound;
            }

            return new ResponseData
            {
                Entries = results.Select(e => new ResponseEntry
                {
                    EntryName = e.Strings.ReadSafe(PwDefs.TitleField),
                    Username = e.Strings.ReadSafe(PwDefs.UserNameField),
                    Password = e.Strings.ReadSafe(PwDefs.PasswordField)
                }).ToArray()
            };
        }
    }
}
