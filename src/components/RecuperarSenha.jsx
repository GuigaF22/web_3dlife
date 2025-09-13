import React, { useState } from "react";

export default function RecuperarSenha({ show, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);

    try {
      const res = await fetch("/api/solicitar-reset-senha.php", {
        method: "POST",
        body: formData,
      });

      let result;
      try {
        result = await res.json();
      } catch {
        alert("❌ O servidor retornou uma resposta inválida.");
        setIsLoading(false);
        return;
      }

      if (result.success) {
        alert("✅ " + result.message + (result.link ? `\n🔗 ${result.link}` : ""));
        onClose();
      } else {
        alert("❌ " + (result.error || "Falha ao solicitar redefinição."));
      }
    } catch (err) {
      alert("⚠️ Erro de conexão com servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl max-w-md w-full border border-yellow-400/40">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">Recuperar Senha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Digite seu e-mail"
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
            required
          />
          <button
            type="submit"
            className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
              isLoading
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar Link"}
          </button>
        </form>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
