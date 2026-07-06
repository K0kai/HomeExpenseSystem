using HES_backend.Objects;
using HES_backend.Repository;
using Microsoft.EntityFrameworkCore;

namespace HES_backend.Services
{
    public class TransactionService
    {
        private readonly AppDbContext _context;

        public TransactionService(AppDbContext context)
        {
            _context = context;
        }
        /// <summary>
        /// Converte um TransactionCreateDTO em um objeto Transaction.
        /// </summary>
        /// <param name="transactionDTO"></param>
        /// <returns></returns>
        private static Transaction CreateDTOToTransaction(TransactionCreateDTO transactionDTO)
        {
            var transaction = new Transaction
            {
                Description = transactionDTO.Description ?? string.Empty,
                Amount = transactionDTO.Amount,
                Type = transactionDTO.TransactionType,
                UserId = transactionDTO.UserId
            };
            return transaction;
        }
        /// <summary>
        /// Cria uma transação a partir de um TransactionCreateDTO e a adiciona ao banco de dados.
        /// </summary>
        /// <param name="transactionDTO"></param>
        public void AddTransaction(TransactionCreateDTO transactionDTO)
        {
            var transaction = CreateDTOToTransaction(transactionDTO);
            _context.Transactions.Add(transaction);
            _context.SaveChanges();
        }
        /// <summary>
        /// Retorna todas as transações do banco de dados.
        /// </summary>
        /// <returns></returns>
        public async Task<List<Transaction>> GetAllTransactions()
        {
            return await _context.Transactions.ToListAsync();
        }
        /// <summary>
        /// Retorna todas as transações de um usuário específico com base no userId.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public async Task<List<Transaction>> GetTransactionsByUserId(int userId)
        {
            return await _context.Transactions.Where(t => t.UserId == userId).ToListAsync();
        }




    }
}
