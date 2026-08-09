using Microsoft.AspNetCore.Mvc;
using sportsphere_notification_service.Data;
using sportsphere_notification_service.Models;
using sportsphere_notification_service.Services;

namespace sportsphere_notification_service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly NotificationDbContext _dbContext;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(IEmailService emailService, NotificationDbContext dbContext, ILogger<NotificationsController> logger)
        {
            _emailService = emailService;
            _dbContext = dbContext;
            _logger = logger;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendNotification([FromBody] NotificationRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.RecipientEmail))
            {
                return BadRequest("Invalid request or missing email.");
            }

            var log = new NotificationLog
            {
                UserId = request.UserId,
                RecipientEmail = request.RecipientEmail,
                NotificationType = request.NotificationType,
                Channel = "Email",
                Status = "Pending"
            };

            _dbContext.NotificationLogs.Add(log);
            await _dbContext.SaveChangesAsync();

            try
            {
                string subject = GetSubject(request.NotificationType);
                string body = GenerateHtmlCard(request.NotificationType, request.Payload);

                await _emailService.SendEmailAsync(request.RecipientEmail, subject, body);

                log.Status = "Sent";
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Notification sent successfully", logId = log.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification");
                log.Status = "Failed";
                log.ErrorMessage = ex.Message;
                await _dbContext.SaveChangesAsync();

                return StatusCode(500, "Failed to send notification.");
            }
        }

        private string GetSubject(string notificationType)
        {
            return notificationType switch
            {
                "WelcomeEmail" => "Welcome to Sportsphere!",
                "OtpVerification" => "Your Sportsphere Verification Code",
                "PasswordReset" => "Reset Your Sportsphere Password",
                "ManagerRegistration" => "Welcome to Sportsphere Manager Portal",
                _ => $"Sportsphere - {notificationType}"
            };
        }

        private string GenerateHtmlCard(string type, Dictionary<string, string> payload)
        {
            string primaryColor = "#0F766E";
            string textPrimary = "#0F172A";
            string textSecondary = "#64748B";
            string surfaceColor = "#FFFFFF";
            string bgColor = "#F8FAFC";
            string borderColor = "#E2E8F0";
            string successColor = "#16A34A";
            string buttonStyle = $"display:inline-block;padding:12px 24px;background-color:{primaryColor};color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;margin-top:10px;";
            string successButtonStyle = $"display:inline-block;padding:12px 24px;background-color:{successColor};color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;margin-top:10px;";

            string content = type switch
            {
                "WelcomeEmail" => $@"
                    <h2 style='color:{textPrimary};margin-top:0;'>Welcome to SportSphere!</h2>
                    <p style='color:{textSecondary};'>Hi <strong>{GetValue(payload, "name")}</strong>,</p>
                    <p style='color:{textSecondary};'>We are thrilled to have you on board. Get ready to explore and book the best sports venues near you!</p>
                    <div style='text-align:center;margin-top:20px;'>
                        <a href='http://localhost:5173' style='{buttonStyle}'>Explore Now</a>
                    </div>",
                
                "OtpVerification" => $@"
                    <h2 style='color:{textPrimary};margin-top:0;'>Verification Code</h2>
                    <p style='color:{textSecondary};'>Please use the following OTP to verify your account.</p>
                    <div style='background-color:{bgColor};border:1px solid {borderColor};border-radius:8px;padding:20px;text-align:center;margin:20px 0;'>
                        <h3 style='margin:0;letter-spacing:8px;font-size:32px;color:{primaryColor};'>{GetValue(payload, "otp")}</h3>
                    </div>
                    <p style='color:{textSecondary};font-size:14px;'>This code will expire in 10 minutes.</p>",

                "PasswordReset" => $@"
                    <h2 style='color:{textPrimary};margin-top:0;'>Password Reset Request</h2>
                    <p style='color:{textSecondary};'>We received a request to reset your password. Click the button below to set a new password:</p>
                    <div style='text-align:center;margin-top:20px;'>
                        <a href='{GetValue(payload, "resetLink")}' style='{successButtonStyle}'>Reset Password</a>
                    </div>
                    <p style='color:{textSecondary};font-size:14px;margin-top:20px;'>If you didn't request this, please ignore this email.</p>",

                "ManagerRegistration" => $@"
                    <h2 style='color:{textPrimary};margin-top:0;'>Welcome, Manager {GetValue(payload, "name")}!</h2>
                    <p style='color:{textSecondary};'>Your manager account has been created. To get started, please set your password using the link below:</p>
                    <div style='text-align:center;margin-top:20px;'>
                        <a href='{GetValue(payload, "resetLink")}' style='{buttonStyle}'>Set Password</a>
                    </div>",

                _ => $@"
                    <h2 style='color:{textPrimary};margin-top:0;'>New Notification</h2>
                    <p style='color:{textSecondary};'>You have a new <strong>{type}</strong> notification.</p>"
            };

            return $@"
            <div style='background-color:{bgColor};padding:40px 20px;font-family:""Inter"",-apple-system,BlinkMacSystemFont,""Segoe UI"",Roboto,sans-serif;'>
                <div style='max-width:600px;margin:0 auto;background-color:{surfaceColor};border:1px solid {borderColor};border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);'>
                    <div style='background-color:{primaryColor};color:#ffffff;padding:24px;text-align:center;'>
                        <h1 style='margin:0;font-size:24px;font-weight:700;letter-spacing:1px;'>SportSphere</h1>
                    </div>
                    <div style='padding:32px;line-height:1.6;'>
                        {content}
                    </div>
                    <div style='background-color:{bgColor};color:{textSecondary};padding:20px;text-align:center;font-size:13px;border-top:1px solid {borderColor};'>
                        <p style='margin:0;'>&copy; {DateTime.Now.Year} SportSphere. All rights reserved.</p>
                        <p style='margin:4px 0 0 0;'>Play Together. Book Smarter.</p>
                    </div>
                </div>
            </div>";
        }

        private string GetValue(Dictionary<string, string> payload, string key)
        {
            return payload != null && payload.TryGetValue(key, out var val) ? val : "";
        }
    }

    public class NotificationRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string RecipientEmail { get; set; } = string.Empty;
        public string NotificationType { get; set; } = string.Empty;
        public List<string> Channels { get; set; } = new List<string>();
        public Dictionary<string, string> Payload { get; set; } = new Dictionary<string, string>();
    }
}
