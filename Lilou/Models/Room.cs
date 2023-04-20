namespace Lilou.Models;

public class Room
{
    public int Id { get; set; }
    public string RoomName { get; set; }
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}