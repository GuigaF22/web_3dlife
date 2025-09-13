import React, { useState } from "react";

export default function Cadastro({ show, onClose, onRecover }) {
  const [isLoading, setIsLoading] = useState(false);
  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);

    try {
      const res = await fetch("/api/register_with_email.php", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        alert("✅ Conta criada com sucesso! Faça login no Firestorm.");
        e.target.reset();
        onClose();
      } else {
        alert("❌ Erro: " + (json.error || "Falha no cadastro."));
      }
    } catch (err) {
      alert("⚠️ Falha de conexão com servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl max-w-md w-full border border-yellow-400/40">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">
          Cadastro no 3D Life
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="FirstName"
            placeholder="Nome"
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
          />
          <input
            type="text"
            name="LastName"
            placeholder="Sobrenome"
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
          />
          <input
            type="email"
            name="Email"
            placeholder="E-mail"
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
          />
          <input
            type="password"
            name="Password"
            placeholder="Senha (mín. 6 caracteres)"
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
              isLoading
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
            }`}
          >
            {isLoading ? "Enviando..." : "Cadastrar"}
          </button>
        </form>
        <div className="mt-4 text-right">
          <button
            onClick={() => {
              onClose();
              onRecover();
            }}
            className="text-yellow-400 hover:underline"
          >
            Perdeu a senha?
          </button>
        </div>
      </div>
    </div>
  );
}
