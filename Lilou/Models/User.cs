namespace Lilou.Models;

// public class User
// {
//     public int Id { get; set; }
//     public string Name { get; set; } = null!;
//     public string? Photo { get; set; }
//     public DateTime CreatedAt { get; set; }
//     public DateTime UpdatedAt { get; set; }
//     public virtual ICollection<Channel> Channels { get; set; } = new List<Channel>();
// }


public class User
{
    public int Id { get; set; }
    public string UserName { get; set; }

    public int? Progress { get; set; } = 0;

    public int? RoomId { get; set; }
    public Room? Room { get; set; }

}