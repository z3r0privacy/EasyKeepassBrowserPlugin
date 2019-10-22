﻿using KeePass.Plugins;
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

        public HTTPHandler(IPluginHost pHost)
        {
            _pHost = pHost;
            _server = new HttpListener();
            _server.Prefixes.Add("http://localhost:34567/");
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

                RequestData reqData = null;
                try
                {
                    var rawData = new StreamReader(ctx.Request.InputStream).ReadToEnd();
                    reqData = JsonConvert.DeserializeObject<RequestData>(rawData);
                }
                catch (Exception)
                {
                    ctx.Response.StatusCode = 400;
                    ctx.Response.OutputStream.Close();
                    return;
                }

                if (reqData == null || string.IsNullOrEmpty(reqData.Url))
                {
                    ctx.Response.StatusCode = 400;
                    ctx.Response.OutputStream.Close();
                    return;
                }

                var responseData = FindCredentials(reqData.Url);

                var response = JsonConvert.SerializeObject(responseData);
                var writer = new StreamWriter(ctx.Response.OutputStream);
                writer.Write(response);

                ctx.Response.StatusCode = 200;
                writer.Close();
                writer.Dispose();
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
                FoundData = false
            };

            if (_pHost == null)
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

            var results = new PwObjectList<PwEntry>();
            _pHost.Database.RootGroup.SearchEntries(sp, results);

            while (results.UCount == 0 && cleanedSite.CanStrip)
            {
                sp.SearchString = cleanedSite.Strip();
                _pHost.Database.RootGroup.SearchEntries(sp, results);
            }

            if (results.UCount == 0)
            {
                return notFound;
            }

            PwEntry e = null;

            if (results.UCount > 1)
            {
                e = results.Where(r => !string.IsNullOrEmpty(r.Strings.ReadSafe(PwDefs.UserNameField)) &&
                                        !string.IsNullOrEmpty(r.Strings.ReadSafe(PwDefs.PasswordField)))
                            .OrderByDescending(r => r.CreationTime).FirstOrDefault();
            }

            if (e == default)
            {
                e = results.First();
            }
            return new ResponseData
            {
                FoundData = true,
                Username = e.Strings.ReadSafe(PwDefs.UserNameField),
                Password = e.Strings.ReadSafe(PwDefs.PasswordField)
            };
        }
    }
}