namespace EasyBrowserPlugin
{
    partial class AddonSetupWindow
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.txtKey = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.btnCopy = new System.Windows.Forms.Button();
            this.btnOk = new System.Windows.Forms.Button();
            this.lblCopied = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // txtKey
            // 
            this.txtKey.Location = new System.Drawing.Point(15, 25);
            this.txtKey.Name = "txtKey";
            this.txtKey.ReadOnly = true;
            this.txtKey.Size = new System.Drawing.Size(289, 20);
            this.txtKey.TabIndex = 0;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(12, 9);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(235, 13);
            this.label1.TabIndex = 1;
            this.label1.Text = "Copy this value into the addon where requested.";
            // 
            // btnCopy
            // 
            this.btnCopy.Location = new System.Drawing.Point(15, 51);
            this.btnCopy.Name = "btnCopy";
            this.btnCopy.Size = new System.Drawing.Size(105, 23);
            this.btnCopy.TabIndex = 2;
            this.btnCopy.Text = "Copy to clipboard";
            this.btnCopy.UseVisualStyleBackColor = true;
            this.btnCopy.Click += new System.EventHandler(this.btnCopy_Click);
            // 
            // btnOk
            // 
            this.btnOk.Location = new System.Drawing.Point(228, 51);
            this.btnOk.Name = "btnOk";
            this.btnOk.Size = new System.Drawing.Size(75, 23);
            this.btnOk.TabIndex = 3;
            this.btnOk.Text = "Close";
            this.btnOk.UseVisualStyleBackColor = true;
            this.btnOk.Click += new System.EventHandler(this.btnOk_Click);
            // 
            // lblCopied
            // 
            this.lblCopied.AutoSize = true;
            this.lblCopied.Location = new System.Drawing.Point(124, 56);
            this.lblCopied.Name = "lblCopied";
            this.lblCopied.Size = new System.Drawing.Size(98, 13);
            this.lblCopied.TabIndex = 4;
            this.lblCopied.Text = "Copied to clipboard";
            this.lblCopied.Visible = false;
            // 
            // AddonSetupWindow
            // 
            this.AcceptButton = this.btnOk;
            this.AccessibleRole = System.Windows.Forms.AccessibleRole.Window;
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(315, 84);
            this.ControlBox = false;
            this.Controls.Add(this.lblCopied);
            this.Controls.Add(this.btnOk);
            this.Controls.Add(this.btnCopy);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.txtKey);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "AddonSetupWindow";
            this.ShowIcon = false;
            this.ShowInTaskbar = false;
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "AddonSetupWindow";
            this.TopMost = true;
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox txtKey;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Button btnCopy;
        private System.Windows.Forms.Button btnOk;
        private System.Windows.Forms.Label lblCopied;
    }
}