using HES_backend.Objects;
using HES_backend.Repository;
using Microsoft.EntityFrameworkCore;

namespace HES_backend.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }
        /// <summary>
        /// Retorna um usuário com base no id fornecido.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }
        /// <summary>
        /// Retorna todos os usuários do banco de dados.
        /// </summary>
        /// <returns></returns>
        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }
        /// <summary>
        /// Adiciona um novo usuário ao banco de dados.
        /// </summary>
        /// <param name="user"></param>
        public void AddUser(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
        }
        /// <summary>
        /// Deleta um usuário e todas as suas transações associadas com base no id do usuário.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public bool DeleteUser(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null)
            {
                return false;
            }
            var transactions = _context.Transactions.Where(t => t.UserId == id).ToList();
            _context.Users.Remove(user);
            _context.Transactions.RemoveRange(transactions);
            _context.SaveChanges();
            return true;
        }
        /// <summary>
        /// Verifica se o usuário é menor de idade com base na data de nascimento.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="ArgumentException"></exception>
        public Task<bool> IsUserUnderage(int id)
        {
            var user = _context.Users.Find(id) ?? throw new ArgumentException($"User with id {id} not found.");
            var legalDate = user.DateOfBirth.ToDateTime(TimeOnly.MinValue).AddYears(18);

            return Task.FromResult(legalDate > DateTime.Today);
        }



    }
}
