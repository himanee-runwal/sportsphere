using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sportsphere_notification_service.Models
{
    public class NotificationLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string RecipientEmail { get; set; } = string.Empty;

        [Required]
        public string NotificationType { get; set; } = string.Empty;

        [Required]
        public string Channel { get; set; } = "Email";

        [Required]
        public string Status { get; set; } = "Pending";

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public string? ErrorMessage { get; set; }
    }
}
