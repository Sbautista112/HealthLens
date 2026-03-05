#!/usr/bin/env python

import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import argparse
import matplotlib.pyplot as plt

from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
from torchvision.models import (
    efficientnet_b0,
    efficientnet_b3,
    efficientnet_b4,
    resnet50,
    convnext_tiny,
    vit_b_16,
    densenet121
)

from sklearn.model_selection import train_test_split
from torch.cuda.amp import autocast, GradScaler

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

parser = argparse.ArgumentParser()

parser.add_argument("--model", type=str, required=True,
                    choices=[
                        "efficientnetb0",
                        "efficientnetb3",
                        "efficientnetb4",
                        "densenet121",
                        "resnet50",
                        "convnext_tiny",
                        "vit_b_16"
                    ])
parser.add_argument("--mode", type=str, required=True,
                    choices=["full", "light"])
parser.add_argument("--epochs", type=int, default=20)
parser.add_argument("--batch_size", type=int, default=32)
parser.add_argument("--lr", type=float, default=1e-4)

args = parser.parse_args()

if args.model == "efficientnetb4":
    base_img_size = 380
elif args.model in ["efficientnetb0", "efficientnetb3"]:
    base_img_size = 300
else:
    base_img_size = 224

if args.mode == "light":
    EPOCHS = min(args.epochs, 5)
    BATCH_SIZE = min(args.batch_size, 8)
    LR = args.lr
    IMG_SIZE = min(base_img_size, 224)
    TRAIN_WORKERS = 2
    VAL_WORKERS = 1
else:
    EPOCHS = args.epochs
    BATCH_SIZE = args.batch_size
    LR = args.lr
    IMG_SIZE = base_img_size
    TRAIN_WORKERS = 6
    VAL_WORKERS = 4

DATA_DIR = "ml/Data/ISIC_2019_Processed"
MODEL_SAVE_PATH = "ml/models/best_model.pth"

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(25),
    transforms.ColorJitter(0.2, 0.2, 0.15, 0.05),
    transforms.RandomResizedCrop((IMG_SIZE, IMG_SIZE), scale=(0.9, 1.1)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

dataset = datasets.ImageFolder(DATA_DIR, transform=transform)

labels = [label for _, label in dataset.samples]
indices = np.arange(len(dataset))

train_idx, temp_idx, y_train, y_temp = train_test_split(
    indices,
    labels,
    test_size=0.3,
    stratify=labels,
    random_state=42
)

val_idx, test_idx, _, _ = train_test_split(
    temp_idx,
    y_temp,
    test_size=0.5,
    stratify=y_temp,
    random_state=42
)

if args.mode == "light":
    train_idx = train_idx[:min(1000, len(train_idx))]
    val_idx = val_idx[:min(300, len(val_idx))]

train_dataset = Subset(dataset, train_idx)
val_dataset = Subset(dataset, val_idx)
test_dataset = Subset(dataset, test_idx)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=TRAIN_WORKERS,
    pin_memory=torch.cuda.is_available()
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=VAL_WORKERS,
    pin_memory=torch.cuda.is_available()
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE
)

if args.model == "efficientnetb0":
    model = efficientnet_b0(weights="IMAGENET1K_V1")
    for p in model.parameters():
        p.requires_grad = False
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(dataset.classes))

elif args.model == "efficientnetb3":
    model = efficientnet_b3(weights="IMAGENET1K_V1")
    for p in model.parameters():
        p.requires_grad = False
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(dataset.classes))

elif args.model == "efficientnetb4":
    model = efficientnet_b4(weights="IMAGENET1K_V1")
    for p in model.parameters():
        p.requires_grad = False
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(dataset.classes))

elif args.model == "densenet121":
    model = densenet121(weights="IMAGENET1K_V1")
    for p in model.parameters():
        p.requires_grad = False
    model.classifier = nn.Linear(model.classifier.in_features, len(dataset.classes))

elif args.model == "resnet50":
    model = resnet50(weights="IMAGENET1K_V1")
    for p in model.parameters():
        p.requires_grad = False
    model.fc = nn.Linear(model.fc.in_features, len(dataset.classes))

elif args.model == "convnext_tiny":
    model = convnext_tiny(weights="IMAGENET1K_V1")
    for p in model.parameters():
        p.requires_grad = False
    model.classifier[2] = nn.Linear(model.classifier[2].in_features, len(dataset.classes))

elif args.model == "vit_b_16":
    model = vit_b_16(weights="IMAGENET1K_V1")
    for p in model.parameters():
        p.requires_grad = False
    model.heads.head = nn.Linear(model.heads.head.in_features, len(dataset.classes))

model = model.to(DEVICE)

criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=LR
)

scaler = GradScaler(enabled=torch.cuda.is_available())

train_losses = []
val_losses = []
train_accs = []
val_accs = []

def train_one_epoch():
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    for images, labels in train_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        optimizer.zero_grad()
        with autocast(enabled=torch.cuda.is_available()):
            outputs = model(images)
            loss = criterion(outputs, labels)
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        total_loss += loss.item()
        _, preds = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (preds == labels).sum().item()
    return total_loss / len(train_loader), correct / total

def validate():
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            with autocast(enabled=torch.cuda.is_available()):
                outputs = model(images)
                loss = criterion(outputs, labels)
            total_loss += loss.item()
            _, preds = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (preds == labels).sum().item()
    return total_loss / len(val_loader), correct / total

best_val_acc = 0
patience = 5
patience_counter = 0

for epoch in range(EPOCHS):
    train_loss, train_acc = train_one_epoch()
    val_loss, val_acc = validate()

    train_losses.append(train_loss)
    val_losses.append(val_loss)
    train_accs.append(train_acc)
    val_accs.append(val_acc)

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        patience_counter = 0

        os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
        torch.save(model.state_dict(), MODEL_SAVE_PATH)

        plt.figure()
        plt.plot(train_losses, label="Train Loss")
        plt.plot(val_losses, label="Validation Loss")
        plt.xlabel("Epoch")
        plt.ylabel("Loss")
        plt.title("Loss vs Epochs")
        plt.legend()
        plt.savefig(os.path.join(os.path.dirname(MODEL_SAVE_PATH), "loss_vs_epochs.png"))
        plt.close()

        plt.figure()
        plt.plot(train_accs, label="Train Accuracy")
        plt.plot(val_accs, label="Validation Accuracy")
        plt.xlabel("Epoch")
        plt.ylabel("Accuracy")
        plt.title("Accuracy vs Epochs")
        plt.legend()
        plt.savefig(os.path.join(os.path.dirname(MODEL_SAVE_PATH), "accuracy_vs_epochs.png"))
        plt.close()

        with open(os.path.join(os.path.dirname(MODEL_SAVE_PATH), "best_config.txt"), "w") as f:
            f.write("Best Model Configuration\n\n")
            f.write(f"Mode: {args.mode}\n")
            f.write(f"Model: {args.model}\n")
            f.write(f"Epochs: {EPOCHS}\n")
            f.write(f"Batch Size: {BATCH_SIZE}\n")
            f.write(f"Learning Rate: {LR}\n")
            f.write(f"Image Size: {IMG_SIZE}\n")
            f.write(f"Best Validation Accuracy: {best_val_acc:.4f}\n")
    else:
        patience_counter += 1

    print(f"Epoch {epoch+1}")
    print(f"Train Loss {train_loss:.4f} | Train Acc {train_acc:.4f}")
    print(f"Val Loss {val_loss:.4f} | Val Acc {val_acc:.4f}")
    print("-"*40)

    if patience_counter >= patience:
        print("Early stopping triggered")
        break

print("Training complete.")