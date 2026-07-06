using HES_backend.Objects;
using Microsoft.EntityFrameworkCore;

namespace HES_backend.Repository
{
    /// <summary>
    /// Representa o contexto do banco de dados da aplicação, fornecendo acesso às tabelas de usuários e transações.
    /// </summary>
    public class AppDbContext : DbContext
    {
        /// <summary>
        /// Construtor do contexto do banco de dados, que recebe as opções de configuração do DbContext.
        /// </summary>
        /// <param name="options"></param>
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }
        /// <summary>
        /// Representa a tabela de usuários no banco de dados.
        /// </summary>
        public DbSet<User> Users { get; set; }
        /// <summary>
        /// Representa a tabela de transações no banco de dados.
        /// </summary>
        public DbSet<Transaction> Transactions { get; set; }
    }
}
