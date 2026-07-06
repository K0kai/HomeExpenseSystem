using HES_backend.Objects;
using HES_backend.Services;

namespace HES_backend.Repository
{
    public class DbSeeder
    {
        private readonly AppDbContext _context;
        private readonly UserService _userService;

        public DbSeeder(AppDbContext context, UserService userService)
        {
            _context = context;
            _userService = userService;
        }

        private readonly List<string> UserNameList =
        [
            "Alice",
            "Roberto",
            "Ricardo",
            "Maria",
            "João",
            "Ana",
            "Pedro",
            "Carla",
        ];

        private readonly List<string> PositiveTransactionsList =
        [
            "Salário",
            "Venda de produto",
            "Investimento",
            "Prêmio",
            "Bônus",
        ];

        private readonly List<string> NegativeTransactionsList =
        [
            "Aluguel",
            "Supermercado",
            "Transporte",
            "Lazer",
            "Saúde",
        ];

        public async Task SeedAsync()
        {
            if (!_context.Users.Any())
            {
                var random = new Random();
                foreach (var name in UserNameList)
                {
                    var age = random.Next(10, 60);
                    var user = new User
                    {
                        Name = name,
                        DateOfBirth = DateOnly.FromDateTime(DateTime.Today.AddYears(-age))
                    };
                    _context.Users.Add(user);
                }
                _context.SaveChanges();
            }
            if (!_context.Transactions.Any())
            {
                var maxTransactions = 20;
                for (var i = 0;  i < maxTransactions; i++)
                {
                    var random = new Random();
                    var userId = random.Next(1, _context.Users.Count() + 1);
                    var isUserUndearge = await _userService.IsUserUnderage(userId);
                    var amount = random.Next(1, 1000);
                    var transactionType = isUserUndearge ? TransactionType.Expense : (TransactionType)random.Next(1, 2);
                    var transaction = new Transaction
                    {
                        UserId = userId,
                        Amount = amount,
                        Description = transactionType == TransactionType.Receipt ? PositiveTransactionsList[random.Next(PositiveTransactionsList.Count)] : NegativeTransactionsList[random.Next(NegativeTransactionsList.Count)],
                        Type = transactionType
                    };
                    _context.Transactions.Add(transaction);
                }
                _context.SaveChanges();
            }
        }
    }
}
