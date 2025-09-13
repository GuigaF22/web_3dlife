import React, { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import MapaVirtual3D from "./MapaVirtual3D";

// Importando os novos componentes
import Cadastro from "./components/Cadastro";
import RecuperarSenha from "./components/RecuperarSenha";
import RedefinirSenha from "./components/RedefinirSenha";

// 🔥 Modal base reutilizável para textos (Tutorial, DMCA, Privacidade)
function ModalBase({ show, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div
        className={`bg-gray-900 p-8 rounded-xl shadow-xl w-full ${maxWidth} border border-yellow-400/40`}
      >
        {title && (
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">{title}</h2>
        )}
        <div className="text-gray-300">{children}</div>
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

export default function App() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showRecover, setShowRecover] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [showDmca, setShowDmca] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Detecta se existe token de reset na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setResetToken(token);
      setShowReset(true);
    }
  }, []);

  // Fecha modais ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowTutorial(false);
        setShowRegister(false);
        setShowRecover(false);
        setShowReset(false);
        setShowDmca(false);
        setShowPrivacy(false);
        setShowMap(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-gray-950 text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-4 bg-black/70">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="3D Life" className="h-20 animate-glow" />
        </div>

        <nav className="flex space-x-8 text-lg font-semibold">
          <button
            onClick={() => setShowMap(true)}
            className="hover:text-yellow-400"
          >
            Mapa
          </button>
          <button
            onClick={() => alert("📩 Contato será adicionado futuramente!")}
            className="hover:text-yellow-400"
          >
            Contato
          </button>
        </nav>

        <div>
          <button
            onClick={() => setShowRegister(true)}
            className="px-6 py-2 bg-yellow-500 text-black rounded-lg shadow hover:bg-yellow-400 transition font-semibold"
          >
            Cadastre-se
          </button>
        </div>
      </header>

      {/* HERO */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Uma vida sem fronteiras com a{" "}
          <span className="text-yellow-400">3D Life</span>
        </h1>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl">
          O 3D Life é um metaverso baseado em OpenSim, onde você cria, explora e
          vive experiências únicas em um mundo virtual sem limites.
        </p>

        <button
          onClick={() => setShowTutorial(true)}
          className="mt-6 px-6 py-3 bg-yellow-500 text-black rounded-xl shadow hover:bg-yellow-400 transition font-semibold"
        >
          Comece Agora
        </button>
      </main>

      {/* MAPA FULLSCREEN */}
      {showMap && (
        <div className="fixed inset-0 bg-black z-50 overflow-hidden">
          <button
            onClick={() => setShowMap(false)}
            className="absolute top-4 right-4 text-white hover:text-red-500 text-xl z-50 bg-black/70 rounded-full px-4 py-2 font-bold"
          >
            × Fechar Mapa
          </button>
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-yellow-400 text-xl font-bold">
                🔄 Carregando Mapa...
              </div>
            }
          >
            <MapaVirtual3D />
          </React.Suspense>
        </div>
      )}

      {/* Tutorial */}
      <ModalBase
        show={showTutorial}
        onClose={() => setShowTutorial(false)}
        title="Tutorial - Instalação do Firestorm"
      >
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>Baixe o Firestorm no link oficial.</li>
          <li>Instale normalmente no seu computador.</li>
          <li>Abra o Firestorm e configure sua conta 3D Life.</li>
          <li>Conecte-se e aproveite o mundo virtual!</li>
          <li>Dica: use headset VR para imersão máxima!</li>
        </ol>
        <div className="mt-6 flex justify-center gap-4">
          <a
            href="https://www.firestormviewer.org/os-operating-system/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition"
          >
            Download
          </a>
          <button
            onClick={() => {
              setShowTutorial(false);
              setShowRegister(true);
            }}
            className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-400 transition"
          >
            Criar Conta
          </button>
          <a
            href="https://wiki.firestormviewer.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition"
          >
            Mais Info
          </a>
        </div>
      </ModalBase>

      {/* Cadastro */}
      <Cadastro
        show={showRegister}
        onClose={() => setShowRegister(false)}
        onRecover={() => setShowRecover(true)}
      />

      {/* Recuperar Senha */}
      <RecuperarSenha
        show={showRecover}
        onClose={() => setShowRecover(false)}
      />

      {/* Redefinir Senha */}
      <RedefinirSenha
        show={showReset}
        onClose={() => setShowReset(false)}
        token={resetToken}
      />

      {/* DMCA */}
      <ModalBase
        show={showDmca}
        onClose={() => setShowDmca(false)}
        title="DMCA - Direitos Autorais"
      >
        <p>
          O 3D Life Virtual respeita os direitos de propriedade intelectual e
          cumpre as disposições do Digital Millennium Copyright Act (DMCA).
        </p>
        <p>
          Se você acredita que seu trabalho protegido por direitos autorais foi
          copiado de forma que constitua violação, entre em contato:
        </p>
        <div className="bg-yellow-900/20 border border-yellow-400/40 rounded-lg p-4">
          <p>
            <strong>Email:</strong>{" "}
            <span className="text-yellow-400">
              suporte@3dlifevirtual.com.br
            </span>
          </p>
          <p>
            <strong>Assunto:</strong> DMCA - Violação de Direitos Autorais
          </p>
        </div>
      </ModalBase>

      {/* Política de Privacidade */}
      <ModalBase
        show={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title="Política de Privacidade"
      >
        <p>
          Coletamos apenas as informações necessárias para criar e manter sua
          conta no 3D Life Virtual.
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>Nome e sobrenome</li>
          <li>E-mail</li>
          <li>Senha criptografada</li>
        </ul>
        <p>Não compartilhamos, vendemos ou cedemos seus dados a terceiros.</p>
      </ModalBase>

      {/* FOOTER */}
      <footer className="bg-black/80 text-gray-400 text-center p-6 mt-12">
        <div className="space-x-6 mb-4">
          <button
            onClick={() => setShowDmca(true)}
            className="hover:text-yellow-400"
          >
            DMCA
          </button>
          <button
            onClick={() => setShowPrivacy(true)}
            className="hover:text-yellow-400"
          >
            Política de Privacidade
          </button>
        </div>
        <p>
          © {new Date().getFullYear()} 3D Life Virtual. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
