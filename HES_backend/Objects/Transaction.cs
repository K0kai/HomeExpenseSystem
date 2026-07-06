using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HES_backend.Objects
{
    public class Transaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        [Required]
        public decimal Amount { get; set; } = 0;
        public TransactionType Type { get; set; }
        [Required]
        public int UserId { get; set; }
    }

    public class TransactionCreateDTO
    {
        public string? Description { get; set; }
        public TransactionType TransactionType { get; set; }
        public decimal Amount { get; set; }
        public int UserId { get; set; }
    }


    public enum TransactionType
    {
        Receipt = 1,
        Expense = 2
    }
}
