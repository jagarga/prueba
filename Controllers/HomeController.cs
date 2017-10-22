using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Npgsql;

namespace WebApplication2.Controllers
{
    //[Authorize]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetLayout()
        {
            // Connect to a PostgreSQL database
            NpgsqlConnection conn = new NpgsqlConnection("Server=localhost;User Id=postgres; Password=postgres;Database=OSM_Spain;");
            conn.Open();

            // Define a query returning a single row result set
            string query = "SELECT ST_AsText(geom) FROM public.osm_buildings_a_free_1 limit 5";
            NpgsqlCommand command = new NpgsqlCommand(query, conn);

            // Execute the query and obtain the value of the first column of the first row
            NpgsqlDataReader dr = command.ExecuteReader();
            object geom = null;

            while (dr.Read())
            {
                geom = dr[0];
            }

            conn.Close();

            return Json(new { geom = geom ?? string.Empty }, JsonRequestBehavior.AllowGet);

        }

        public ActionResult GetThemes()
        {
            // Connect to a PostgreSQL database
            NpgsqlConnection conn = new NpgsqlConnection("Server=localhost;User Id=postgres; Password=postgres;Database=OSM_Spain;");
            conn.Open();

            // Define a query returning a single row result set
            string query = "SELECT distinct layer_group FROM public.layer_names";
            NpgsqlCommand command = new NpgsqlCommand(query, conn);

            // Execute the query and obtain the value of the first column of the first row
            NpgsqlDataReader dr = command.ExecuteReader();
            var theme = new List<string>();
            //object theme = null;

            while (dr.Read())
                {
                theme.Add(dr[0].ToString());
                }

            conn.Close();

            //return Json(new {theme ?? string.Empty }, JsonRequestBehavior.AllowGet);
            return Json(new { name = theme.ToList() }, JsonRequestBehavior.AllowGet);
        }
    }
}
