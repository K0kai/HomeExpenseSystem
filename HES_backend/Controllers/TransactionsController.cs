using HES_backend.Objects;
using HES_backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace HES_backend.Controllers
{
    /// <summary>
    /// Controlador responsavel pelo cadastro e listagem de transacoes.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly TransactionService _transactionService;
        private readonly UserService _userService;

        public TransactionsController(
            TransactionService transactionService,
            UserService userService)
        {
            _transactionService = transactionService;
            _userService = userService;
        }

        /// <summary>
        /// Lista todas as transacoes gravadas no SQLite.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<Transaction>>> GetAll()
        {
            return Ok(await _transactionService.GetAllTransactions());
        }

        /// <summary>
        /// Cria uma transacao validando se a pessoa existe e se menores de idade
        /// estao cadastrando somente despesas.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create(TransactionCreateDTO transactionDTO)
        {
            var user = await _userService.GetUserByIdAsync(transactionDTO.UserId);

            if (user == null)
            {
                return BadRequest("A pessoa informada nao existe.");
            }

            if (transactionDTO.Amount <= 0 || string.IsNullOrWhiteSpace(transactionDTO.Description))
            {
                return BadRequest("Descricao e valor positivo sao obrigatorios.");
            }

            if (await _userService.IsUserUnderage(user.Id)
                && transactionDTO.TransactionType == TransactionType.Receipt)
            {
                return BadRequest("Menores de idade podem ter apenas despesas cadastradas.");
            }

            _transactionService.AddTransaction(transactionDTO);

            return CreatedAtAction(nameof(GetAll), null);
        }
    }
}
