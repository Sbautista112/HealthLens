# Skin Disease Classification Model

HealthLens is a machine learning pipeline designed for skin disease classification including acne and cancer detection tasks. The system supports multiple deep learning architectures, flexible training configurations, and automated performance visualization.

Supported models include:
- EfficientNet B0 / B3 / B4  
- DenseNet121  
- ResNet50  
- ConvNeXt Tiny  
- Vision Transformer (ViT B16)  

The pipeline supports light and full training modes, mixed precision training, early stopping, and automatic model checkpoint saving.

Project Structure:

HealthLens/
├── ml/
    ├── scripts/
        └── train.py
        └── requirements.txt
        └── README.mde
    ├── models/
        └── best_model.pth
        └── accuracy_vs_epochs.png
        └── loss_vs_epochs.png
        └── best_config.txt
    ├── Data/
        ├── ISIC_2019_CSVs/
        ├── ISIC_2019_Processed/

The training pipeline automatically saves:
- Best model weights
- Loss and accuracy vs epochs graphs
- Training configuration logs

Training outputs are stored inside:
ml/models/

Files generated include:
- best_model.pth
- loss_vs_epochs.png
- accuracy_vs_epochs.png
- best_config.txt

Make sure you do NOT push large datasets, virtual environments, or cache files to GitHub. Add these to your .gitignore file:
.venv
__pycache__
.DS_Store

---

Setup Instructions

Clone the repository:

git clone <repository_url>
cd HealthLens

Create a virtual environment (recommended for Python projects):

Mac/Linux:
python3 -m venv .venv
source .venv/bin/activate

Windows:
python -m venv .venv
.venv\Scripts\activate

Install required libraries:

pip install -r requirements.txt

Always install dependencies from requirements.txt before running training scripts.

Required libraries include:
- torch
- torchvision
- numpy
- scikit-learn
- matplotlib
- pillow


Training Pipeline Usage

Navigate to training scripts:

cd ml/scripts


Run training using:

python train.py --model MODEL_NAME --mode MODE_NAME

Example commands:

Light training test:
python train.py --model efficientnetb0 --mode light

Full training:
python train.py --model efficientnetb4 --mode full --epochs 30

Custom training configuration:
python train.py --model resnet50 --mode full --epochs 40 --batch_size 32 --lr 0.0001


Training Modes

Light Mode is designed for fast testing and debugging. It automatically:
- Limits epochs to 5 maximum
- Uses smaller batch sizes
- Uses smaller dataset subsets
- Uses fewer data loader workers

Full Mode is designed for final model training and research experiments. It uses:
- Full dataset
- Full training epochs
- Larger compute settings


Model Options

Light Mode Recommended Models:
- efficientnetb0
- densenet121
- resnet50
- convnext_tiny

Full Mode Recommended Models:
- efficientnetb3
- efficientnetb4
- vit_b_16


Training Process

The pipeline automatically:
- Trains using mixed precision when GPU is available
- Tracks training and validation performance
- Applies early stopping to prevent overfitting
- Saves the best performing model based on validation accuracy

Early stopping will trigger if validation accuracy does not improve for 5 epochs.


Notes

Performance depends on hardware availability.
GPU acceleration is automatically detected.
Image preprocessing includes:
- Random horizontal flip
- Random vertical flip
- Random rotation
- Color jitter augmentation
- Random resized cropping
- Normalization using ImageNet statistics


Future Improvements

Potential upgrades include:
- ROC and AUC curve evaluation
- Class imbalance loss weighting
- Multi-disease classification expansion