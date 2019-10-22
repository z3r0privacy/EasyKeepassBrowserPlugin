using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EasyBrowserPlugin
{
    public class RequestData
    {
        public string Url { get; set; }
    }

    public class ResponseData
    {
        public bool FoundData { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
