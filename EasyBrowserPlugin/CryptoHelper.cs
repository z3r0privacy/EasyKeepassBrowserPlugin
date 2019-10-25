using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace EasyBrowserPlugin
{
    class CryptoHelper
    {
        public static string CreateAESKey()
        {
            using (var aes = Aes.Create())
            {
                aes.GenerateKey();
                return Convert.ToBase64String(aes.Key);
            }
        }

        public static RequestData DecryptMessage(EncryptedMessage msg, byte[] key)
        {
            try
            {
                if (msg == null) throw new ArgumentNullException("msg");
                if (key == null) throw new ArgumentNullException("key");

                using (var aes = Aes.Create())
                {
                    aes.IV = Convert.FromBase64String(msg.IV);
                    aes.Key = key;
                    using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                    {
                        using (var ms = new MemoryStream(Convert.FromBase64String(msg.Message)))
                        {
                            using (var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
                            {
                                using (var sr = new StreamReader(cs))
                                {
                                    var json = sr.ReadToEnd();
                                    var data = JsonConvert.DeserializeObject<RequestData>(json);
                                    return data;
                                }
                            }
                        }
                    }
                }

            } catch (Exception)
            {
                MessageBox.Show("Received a request from the browser addon which could not be read. Please consider redo the setup process in the addon.", "Could not read browser addon request", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }

            return null;
        }

        public static EncryptedMessage EncryptMessage(ResponseData data, byte[] key)
        {
            try
            {
                if (data == null) throw new ArgumentNullException("data");
                if (key == null) throw new ArgumentNullException("key");
                var json = JsonConvert.SerializeObject(data);

                using (var aes = Aes.Create())
                {
                    aes.Key = key;
                    aes.GenerateIV();
                    using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                    {
                        using (var ms = new MemoryStream())
                        {
                            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                            {
                                using (var sw = new StreamWriter(cs))
                                {
                                    sw.Write(json);
                                }

                                return new EncryptedMessage
                                {
                                    IV = Convert.ToBase64String(aes.IV),
                                    Message = Convert.ToBase64String(ms.ToArray())
                                };
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                MessageBox.Show("Error occured while sending answer to the browser addOn. Has the key changed in the database? Please ensure the entry named 'EasyBrowserAddonKey' is still available and unchanged.", "Error on sending login entry to browser plugin", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }

            return null;
        }
    }
}
