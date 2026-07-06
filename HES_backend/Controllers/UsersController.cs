using HES_backend.Objects;
using HES_backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace HES_backend.Controllers
{
    /// <summary>
    /// Controlador responsavel pelo cadastro de pessoas usado pelo front-end.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Lista todas as pessoas cadastradas no SQLite.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetAll()
        {
            return Ok(await _userService.GetAllUsersAsync());
        }

        /// <summary>
        /// Cria uma pessoa a partir de nome e idade. A idade recebida no front-end
        /// e convertida para data de nascimento para manter compatibilidade com o modelo.
        /// </summary>
        [HttpPost]
        public IActionResult Create(UserCreateDTO userDTO)
        {
            if (string.IsNullOrWhiteSpace(userDTO.Name) || userDTO.Age < 0)
            {
                return BadRequest("Nome e idade valida sao obrigatorios.");
            }

            var user = new User
            {
                Name = userDTO.Name.Trim(),
                DateOfBirth = DateOnly.FromDateTime(DateTime.Today.AddYears(-userDTO.Age))
            };

            _userService.AddUser(user);

            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
        }

        /// <summary>
        /// Remove a pessoa e todas as suas transacoes vinculadas.
        /// </summary>
        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            return _userService.DeleteUser(id) ? NoContent() : NotFound();
        }
    }

    public class UserCreateDTO
    {
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
    }
}
