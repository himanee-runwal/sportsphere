using Microsoft.EntityFrameworkCore;
using sportsphere_notification_service.Models;

namespace sportsphere_notification_service.Data
{
    public class NotificationDbContext : DbContext
    {
        public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options)
        {
        }

        public DbSet<NotificationLog> NotificationLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Fix for TiDB: explicitly map the Guid to a standard varchar to avoid ascii_general_ci errors
            modelBuilder.Entity<NotificationLog>()
                .Property(e => e.Id)
                .HasColumnType("varchar(36)");
        }
    }
}
