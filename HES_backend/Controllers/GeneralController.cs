using Microsoft.AspNetCore.Mvc;

namespace HES_backend.Controllers
{
    /// <summary>
    /// Controlador geral para a API, fornecendo endpoints de saúde e status.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class GeneralController : ControllerBase
    {
        /// <summary>
        /// Verifica se a API está em execução e retorna um status de saúde.
        /// </summary>
        /// <returns></returns>
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "Running" });
        }
    }
}
