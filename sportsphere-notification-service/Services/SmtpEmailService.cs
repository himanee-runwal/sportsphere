using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace sportsphere_notification_service.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }

    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var host = _configuration["SmtpSettings:Host"];
                var port = int.Parse(_configuration["SmtpSettings:Port"] ?? "25");
                var fromEmail = _configuration["SmtpSettings:FromEmail"];
                var username = _configuration["SmtpSettings:Username"];
                var password = _configuration["SmtpSettings:Password"];

                var message = new MailMessage(fromEmail!, to, subject, body)
                {
                    IsBodyHtml = true
                };

                using var client = new SmtpClient(host, port);
                client.Credentials = new NetworkCredential(username, password);
                client.EnableSsl = true;

                await client.SendMailAsync(message);
                _logger.LogInformation($"Email sent successfully to {to}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {to}");
                throw;
            }
        }
    }
}
