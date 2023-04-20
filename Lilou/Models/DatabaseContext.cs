using Microsoft.EntityFrameworkCore;

namespace Lilou.Models
{
    public class DatabaseContext : DbContext
    {
        public DatabaseContext()
        {
        }

        public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) { }

        // public DbSet<User> Users => Set<User>();
        // public DbSet<Channel> Channels => Set<Channel>();
        // public DbSet<Game> Games => Set<Game>();
        // public DbSet<ChannelDTO> ChannelDTO => Set<ChannelDTO>();

        public DbSet<User> Users { get; set; }
        // public DbSet<Connection> Connections { get; set; }
        public DbSet<Room> Rooms { get; set; }

        // public DbSet<Game> Games { get; set; }

        // protected override void OnModelCreating(ModelBuilder modelBuilder)
        // {
        //     modelBuilder.Entity<ChannelDTO>().HasNoKey();

        //     modelBuilder.Entity<User>()
        //         .Property(e => e.CreatedAt)
        //         .HasDefaultValueSql("now()");
        //     // modelBuilder.Entity<User>()
        //     //     .Property(e => e.Photo)
        //     //     .IsRequired(false);
        //     // modelBuilder.Entity<User>()
        //     //     .HasIndex("Name");
        //     // modelBuilder.Entity<User>()
        //     //     .Property(e => e.UpdatedAt)
        //     //     .HasDefaultValueSql("now()");

        //     modelBuilder.Entity<Channel>()
        //         .Property(e => e.CreatedAt)
        //          .HasDefaultValueSql("now()");

        //     // modelBuilder.Entity<Game>()
        //     //     .Property(e => e.CreatedAt)
        //     //     .HasDefaultValueSql("now()");

        //     // Seeds can be fake dummy (test) data

        //     // Sometimes seeds are important data 
        //     // A default welcome channel


        //     // Seed the users 
        //     modelBuilder.Entity<User>().HasData(
        //         new User { Id = 1, Name = "Alice" },
        //         new User { Id = 2, Name = "Bob" },
        //         new User { Id = 3, Name = "Charlie" }
        //     );

        //     modelBuilder.Entity<Channel>().HasData(
        //         new Channel { Id = 1, Name = "General" },
        //         new Channel { Id = 2, Name = "Random" }
        //     );

        //     // modelBuilder.Entity<Game>().HasData(
        //     //     new Game { Id = 1, WinnerId = 1, ChannelId = 1 },
        //     //     new Game { Id = 2, WinnerId = 2, ChannelId = 1 },
        //     //     new Game { Id = 3, WinnerId = 3, ChannelId = 1 },
        //     //     new Game { Id = 4, WinnerId = 1, ChannelId = 2 },
        //     //     new Game { Id = 5, WinnerId = 2, ChannelId = 2 },
        //     //     new Game { Id = 6, WinnerId = 3, ChannelId = 2 }
        //     // );

        //     // modelBuilder.Entity<User>()
        //     //     .HasMany(u => u.Channels)
        //     //     .WithMany(c => c.Users)
        //     //     .UsingEntity(j => j.HasData(
        //     //         new { ChannelsId = 2, UsersId = 3 },
        //     //         new { ChannelsId = 1, UsersId = 1 },
        //     //         new { ChannelsId = 1, UsersId = 2 },
        //     //         new { ChannelsId = 1, UsersId = 3 },
        //     //         new { ChannelsId = 2, UsersId = 1 },
        //     //         new { ChannelsId = 2, UsersId = 2 }
        //     //     ));

        //     //users only have 1 channel
        //     modelBuilder.Entity<User>()
        //         .HasOne(u => u.Channel)
        //         .WithMany(c => c.Users)
        //         .HasForeignKey(u => u.ChannelId);

        //     modelBuilder.Entity<User>()
        //         .HasIndex("Name");
        // }

    }
}