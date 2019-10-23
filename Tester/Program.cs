using EasyBrowserPlugin;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tester
{
    class Program
    {
        static void Main(string[] args)
        {
            var ebp = new HTTPHandler(null, null);
            ebp.Start();
            Console.ReadKey();
            ebp.Stop();
        }
    }
}
