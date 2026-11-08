import JSZip from 'jszip';

export interface FlutterSourceFile {
  path: string;
  filename: string;
  language: 'dart' | 'yaml' | 'markdown';
  content: string;
  description: string;
}

export const USER_PARENT_AUDIO_PLAYER_DART = `import 'package:flutter/material.dart';

class ParentAudioRecording {
  final String id;
  final String word;
  final String dateString;
  final String duration;
  final bool wasPerfect;

  ParentAudioRecording({
    required this.id,
    required this.word,
    required this.dateString,
    required this.duration,
    required this.wasPerfect,
  });
}

class ParentAudioPlayerScreen extends StatefulWidget {
  const ParentAudioPlayerScreen({Key? key}) : super(key: key);

  @override
  _ParentAudioPlayerScreenState createState() => _ParentAudioPlayerScreenState();
}

class _ParentAudioPlayerScreenState extends State<ParentAudioPlayerScreen> {
  String? _currentlyPlayingId;

  // Lista simulada puxando os dados que salvamos na 'table_history' do SQLite
  final List<ParentAudioRecording> _recordings = [
    ParentAudioRecording(id: '1', word: 'CAT', dateString: 'Today, 4:15 PM', duration: '0:02', wasPerfect: true),
    ParentAudioRecording(id: '2', word: 'SAT', dateString: 'Today, 4:12 PM', duration: '0:03', wasPerfect: true),
    ParentAudioRecording(id: '3', word: 'DOG', dateString: 'Yesterday, 5:30 PM', duration: '0:04', wasPerfect: false),
    ParentAudioRecording(id: '4', word: 'TAP', dateString: 'Oct 24, 6:02 PM', duration: '0:02', wasPerfect: true),
  ];

  void _playAudio(String id) {
    setState(() {
      if (_currentlyPlayingId == id) {
        _currentlyPlayingId = null; // Dá pause se clicar no mesmo
      } else {
        _currentlyPlayingId = id; // Dá play
      }
    });

    // TODO: Integrar com a biblioteca 'audioplayers' para tocar o arquivo local .wav
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xff121212),
      appBar: AppBar(
        title: const Text('KIDS VOICES 🎧', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
        backgroundColor: const Color(0xff1a1a1a),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "HEAR YOUR CHILD READING",
              style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.2),
            ),
            const SizedBox(height: 8),
            const Text(
              "Listen to the audios recorded completely offline during the game missions.",
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 24),
            
            // LISTA DE ÁUDIOS GRAVADOS
            Expanded(
              child: ListView.builder(
                itemCount: _recordings.length,
                itemBuilder: (context, index) {
                  final recording = _recordings[index];
                  bool isPlaying = _currentlyPlayingId == recording.id;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xff1e1e1e),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isPlaying ? const Color(0xff00ff66) : const Color(0xff333333),
                        width: isPlaying ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        // BOTÃO DE PLAY/PAUSE ESTILIZADO
                        GestureDetector(
                          onTap: () => _playAudio(recording.id),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            height: 52,
                            width: 52,
                            decoration: BoxDecoration(
                              color: isPlaying ? const Color(0xff00ff66) : const Color(0xff292929),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              isPlaying ? Icons.pause : Icons.play_arrow,
                              size: 28,
                              color: isPlaying ? Colors.black : Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        
                        // INFORMAÇÕES DA PALAVRA E DATA
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    recording.word,
                                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.black, letterSpacing: 1.1),
                                  ),
                                  const SizedBox(width: 10),
                                  if (recording.wasPerfect)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xff00ff66).withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: const Color(0xff00ff66), width: 1),
                                      ),
                                      child: const Text(
                                        "PERFECT",
                                        style: TextStyle(color: Color(0xff00ff66), fontSize: 10, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                recording.dateString,
                                style: const TextStyle(color: Colors.grey, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        
                        // DURAÇÃO DO ÁUDIO
                        Text(
                          recording.duration,
                          style: const TextStyle(color: Colors.grey, fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`;

export function getFlutterFiles(appName: string = 'jhonx_app'): FlutterSourceFile[] {
  return [
    {
      path: 'lib/screens/parent_audio_player_screen.dart',
      filename: 'parent_audio_player_screen.dart',
      language: 'dart',
      description: 'Kids Voices audio player screen with offline recording playback',
      content: USER_PARENT_AUDIO_PLAYER_DART,
    },
    {
      path: 'pubspec.yaml',
      filename: 'pubspec.yaml',
      language: 'yaml',
      description: 'Flutter project dependencies',
      content: `name: ${appName}
description: "Jhonx London - Complete Phonics Game & Kids Voices Audio Player."
publish_to: 'none'

version: 1.0.0+6

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  sqflite: ^2.3.3
  path: ^1.9.0
  audioplayers: ^6.1.0
  speech_to_text: ^7.0.0
  flutter_tts: ^4.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
    },
  ];
}

export async function downloadFlutterProjectZip(appName: string = 'jhonx_app') {
  const zip = new JSZip();
  const files = getFlutterFiles(appName);

  files.forEach((file) => {
    zip.file(file.path, file.content);
  });

  zip.file(
    'analysis_options.yaml',
    `include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_const_constructors: true
    prefer_const_declarations: true
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${appName}_kids_voices_player.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
